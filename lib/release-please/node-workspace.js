const localeCompare = require('@isaacs/string-locale-compare')('en')
const { NodeWorkspace } = require('release-please/build/src/plugins/node-workspace.js')
const { RawContent } = require('release-please/build/src/updaters/raw-content.js')
const { jsonStringify } = require('release-please/build/src/util/json-stringify.js')
const { addPath } = require('release-please/build/src/plugins/workspace.js')
const { TagName } = require('release-please/build/src/util/tag-name.js')
const { ROOT_PROJECT_PATH } = require('release-please/build/src/manifest.js')
const makeGh = require('./github.js')
const { link, code } = require('./util.js')

const SCOPE = '__REPLACE_WORKSPACE_DEP__'
const WORKSPACE_DEP = new RegExp(`${SCOPE}: (\\S+) (\\S+)`, 'gm')

module.exports = class extends NodeWorkspace {
  constructor (github, ...args) {
    super(github, ...args)
    this.gh = makeGh(github)
  }

  async preconfigure (strategiesByPath, commitsByPath, releasesByPath) {
    // First build a list of all releases that will happen based on
    // the conventional commits
    const candidates = []
    for (const path in strategiesByPath) {
      const pullRequest = await strategiesByPath[path].buildReleasePullRequest(
        commitsByPath[path],
        releasesByPath[path]
      )
      if (pullRequest?.version) {
        candidates.push({ path, pullRequest })
      }
    }

    // Then build the graph of all those releases + any other connected workspaces
    const { allPackages, candidatesByPackage } = await this.buildAllPackages(candidates)
    const orderedPackages = this.buildGraphOrder(
      await this.buildGraph(allPackages),
      Object.keys(candidatesByPackage)
    )

    // Then build a list of all the updated versions
    const updatedVersions = new Map()
    for (const pkg of orderedPackages) {
      const path = this.pathFromPackage(pkg)
      const packageName = this.packageNameFromPackage(pkg)

      let version = null
      const existingCandidate = candidatesByPackage[packageName]
      if (existingCandidate) {
        // If there is an existing pull request use that version
        version = existingCandidate.pullRequest.version
      } else {
        // Otherwise build another pull request (that will be discarded) just
        // to see what the version would be if it only contained a deps commit.
        // This is to make sure we use any custom versioning or release strategy.
        const strategy = strategiesByPath[path]
        const depsSection = strategy.changelogSections.find(c => c.section === 'Dependencies')
        const releasePullRequest = await strategiesByPath[path].buildReleasePullRequest(
          [{ message: `${depsSection.type}:` }],
          releasesByPath[path]
        )
        version = releasePullRequest.version
      }

      updatedVersions.set(packageName, version)
    }

    // Save some data about the preconfiugred releases so we can look it up later
    // when rewriting the changelogs
    this.releasesByPackage = new Map()
    this.pathsByComponent = new Map()

    // Then go through all the packages again and add deps commits
    // for each updated workspace
    for (const pkg of orderedPackages) {
      const path = this.pathFromPackage(pkg)
      const packageName = this.packageNameFromPackage(pkg)
      const graphPackage = this.packageGraph.get(pkg.name)

      // Update dependency versions
      for (const [depName, resolved] of graphPackage.localDependencies) {
        const depVersion = updatedVersions.get(depName)
        const isNotDir = resolved.type !== 'directory'

        // Due to some bugs in release-please we need to create
        // deps commits for all dev and prod dependencies even though
        // we normally would only do a `chore:` commit to bump a dev
        // dep. The tradeoff is an extra path to our workspaces that
        // depend on other workspaces as dev deps.
        if (depVersion && isNotDir) {
          commitsByPath[path].push({
            message: `deps(${SCOPE}): ${depName} ${depVersion.toString()}`,
          })
        }
      }

      const component = await strategiesByPath[path].getComponent()
      this.pathsByComponent.set(component, path)
      this.releasesByPackage.set(packageName, {
        path,
        component,
        currentTag: releasesByPath[path]?.tag,
      })
    }

    return strategiesByPath
  }

  // This is copied from the release-please node-workspace plugin
  // except it only updates the package.json instead of appending
  // anything to changelogs since we've already done that in preconfigure.
  updateCandidate (candidate, pkg, updatedVersions) {
    const newVersion = updatedVersions.get(pkg.name)
    const graphPackage = this.packageGraph.get(pkg.name)

    const updatedPackage = pkg.clone()
    updatedPackage.version = newVersion.toString()
    for (const [depName, resolved] of graphPackage.localDependencies) {
      const depVersion = updatedVersions.get(depName)
      if (depVersion && resolved.type !== 'directory') {
        updatedPackage.updateLocalDependency(resolved, depVersion.toString(), '^')
      }
    }

    for (const update of candidate.pullRequest.updates) {
      if (update.path === addPath(candidate.path, 'package.json')) {
        update.updater = new RawContent(
          jsonStringify(updatedPackage.toJSON(), updatedPackage.rawContent)
        )
      }
    }

    return candidate
  }

  postProcessCandidates (candidates) {
    for (const candidate of candidates) {
      for (const release of candidate.pullRequest.body.releaseData) {
        // Update notes with a link to each workspaces release notes
        // now that we have all of the releases in a single pull request
        release.notes = release.notes.replace(WORKSPACE_DEP, (_, depName, depVersion) => {
          const { currentTag, path, component } = this.releasesByPackage.get(depName)

          const url = this.gh.compare(currentTag, new TagName(
            depVersion,
            component,
            this.repositoryConfig[path].tagSeparator,
            this.repositoryConfig[path].includeVInTag
          ))

          return `${link('Workspace', url)}: ${code(`${depName}@${depVersion}`)}`
        })

        // Find the associated changelog and update that too
        const path = this.pathsByComponent.get(release.component)
        for (const update of candidate.pullRequest.updates) {
          if (update.path === addPath(path, 'CHANGELOG.md')) {
            update.updater.changelogEntry = release.notes
          }
        }
      }

      // Sort root release to the top of the pull request
      candidate.pullRequest.body.releaseData.sort((a, b) => {
        const aPath = this.pathsByComponent.get(a.component)
        const bPath = this.pathsByComponent.get(b.component)
        if (aPath === ROOT_PROJECT_PATH) {
          return -1
        }
        // release please pre sorts based on graph order so
        // this is never called in normal circumstances
        /* istanbul ignore next */
        if (bPath === ROOT_PROJECT_PATH) {
          return 1
        }
        return localeCompare(aPath, bPath)
      })
    }

    return candidates
  }

  // Stub these methods with errors since the preconfigure method should negate these
  // ever being called from the release please base class. If they are called then
  // something has changed that would likely break us in other ways.
  bumpVersion () {
    throw new Error('Should not bump packages. This should be done in preconfigure.')
  }

  newCandidate () {
    throw new Error('Should not create new candidates. This should be done in preconfigure.')
  }
}
