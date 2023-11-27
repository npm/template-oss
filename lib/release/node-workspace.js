const { NodeWorkspace } = require('release-please/build/src/plugins/node-workspace')
const { parseConventionalCommits } = require('release-please/build/src/commit')
const { DEPS } = require('./util')
const { WORKSPACE_MESSAGE } = require('./node-workspace-format')

// This adds a preconfigure method to the release-please node-workspace plugin
// which fixes https://github.com/googleapis/release-please/issues/2089 for our
// use case. We should attempt to upstream this to release-please but it
// fundamentally changes the way the node-workspace plugin behaves so it might
// not be easy to land. For now we extend the base plugin and add one method
// which is much better than previously when we needed to fork and maintain
// release-please ourselves.
class NpmNodeWorkspace extends NodeWorkspace {
  async preconfigure (strategiesByPath, commitsByPath, releasesByPath) {
    // First build a list of all releases that will happen based on the
    // conventional commits
    const candidates = []
    for (const path in strategiesByPath) {
      const pullRequest = await strategiesByPath[path].buildReleasePullRequest(
        parseConventionalCommits(commitsByPath[path]),
        releasesByPath[path]
      )
      // Release please types say this sometimes will return undefined but I could not
      // get any scenario where that was the case. If it was undefined we would want to
      // just ignore it anyway.
      /* istanbul ignore else */
      if (pullRequest) {
        candidates.push({
          path,
          pullRequest,
          config: this.repositoryConfig[path],
        })
      }
    }

    // Then build the graph of all those releases + any other connected workspaces
    const { allPackages, candidatesByPackage } = await this.buildAllPackages(candidates)
    const graph = await this.buildGraph(allPackages)
    const packageNamesToUpdate = this.packageNamesToUpdate(graph, candidatesByPackage)
    const graphPackages = this.buildGraphOrder(graph, packageNamesToUpdate)

    // Then build a list of all the updated versions
    const updatedVersions = {}
    for (const pkg of graphPackages) {
      const path = this.pathFromPackage(pkg)
      const packageName = this.packageNameFromPackage(pkg)
      const existingCandidate = candidatesByPackage[packageName]

      if (existingCandidate) {
        // If there is an existing pull request use that version
        updatedVersions[packageName] = existingCandidate.pullRequest?.version
      } else {
        // Otherwise build another pull request (that will be discarded) just
        // to see what the version would be if it only contained a deps commit.
        // This is to make sure we use any custom versioning or release strategy.
        const releasePullRequest = await strategiesByPath[path].buildReleasePullRequest(
          parseConventionalCommits([{ message: `${DEPS}: ${Math.random()}` }]),
          releasesByPath[path]
        )
        updatedVersions[packageName] = releasePullRequest?.version
      }
    }

    // Then go through all the packages again and add deps commits for each
    // updated workspace
    for (const pkg of graphPackages) {
      const path = this.pathFromPackage(pkg)
      const packageName = this.packageNameFromPackage(pkg)
      const graphPackage = graph.get(packageName)

      // Update dependency versions add a deps commit to each path so it gets
      // processed later. This else never happens in our cases because our
      // packages always have deps, but keeping this around to make it easier to
      // upstream in the future.
      /* istanbul ignore else */
      if (graphPackage.deps) {
        for (const depName of graphPackage.deps) {
          const depVersion = updatedVersions[depName]
          // Same as the above check, we always have a version here but technically
          // we could not in which it would be safe to ignore it.
          /* istanbul ignore else */
          if (depVersion) {
            commitsByPath[path].push({
              message: WORKSPACE_MESSAGE(depName, depVersion.toString()),
            })
          }
        }
      }
    }

    return strategiesByPath
  }
}

module.exports = NpmNodeWorkspace
