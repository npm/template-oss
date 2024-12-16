const localeCompare = require('@isaacs/string-locale-compare')('en')
const { ManifestPlugin } = require('release-please/build/src/plugin.js')
const { addPath } = require('release-please/build/src/plugins/workspace.js')
const { TagName } = require('release-please/build/src/util/tag-name.js')
const { ROOT_PROJECT_PATH } = require('release-please/build/src/manifest.js')
const { DEPS, link, wrapSpecs, list } = require('./util.js')

/* TODO fix flaky tests and enable coverage */
/* c8 ignore start */
module.exports = class extends ManifestPlugin {
  static WORKSPACE_MESSAGE = (name, version) => `${DEPS}(workspace): ${name}@${version}`

  #releasesByPackage = new Map()
  #pathsByComponent = new Map()

  async preconfigure(strategiesByPath) {
    // First build a list of all releases that will happen based on
    // the conventional commits
    for (const path in strategiesByPath) {
      const component = await strategiesByPath[path].getComponent()
      const packageName = await await strategiesByPath[path].getDefaultPackageName()
      this.#pathsByComponent.set(component, path)
      this.#releasesByPackage.set(packageName, { path, component })
    }

    return strategiesByPath
  }

  run(candidates) {
    this.#rewriteWorkspaceChangelogItems(candidates)
    this.#sortReleases(candidates)
    return candidates
  }

  #replaceWorkspace({ name, versionRange }) {
    const version = versionRange.replace(/^[\^~]/, '')
    const { path, component } = this.#releasesByPackage.get(name)
    const { tagSeparator, includeVInTag } = this.repositoryConfig[path]
    const {
      repository: { owner, repo },
    } = this.github
    const tag = new TagName(version, component, tagSeparator, includeVInTag).toString()
    const url = `https://github.com/${owner}/${repo}/releases/tag/${tag}`
    return list(`${link('workspace', url)}: ${wrapSpecs(`${name}@${version}`)}`)
  }

  // I don't like how release-please formats workspace changelog entries
  // so this rewrites them to look like the rest of our changelog. This can't
  // be part of the changelog plugin since they are written after that by the
  // node-workspace plugin. A possible PR to release-please could add an option
  // to customize these or run them through the changelog notes generator.
  #rewriteWorkspaceChangelogItems(candidates) {
    for (const candidate of candidates) {
      for (const release of candidate.pullRequest.body.releaseData) {
        // Update notes with a link to each workspaces release notes
        // now that we have all of the releases in a single pull request
        release.notes = release.notes
          .replace(/^\* The following workspace dependencies were updated\n/gm, '')
          .replace(/^\s{2}\* dependencies\n/gm, '')
          .replace(/^\s{2}\* devDependencies\n/gm, '')
          .replace(/^\s{2}\* peerDependencies\n/gm, '')
          .replace(/^\s{2}\* optionalDependencies\n/gm, '')
          .replace(/^\s{4}\* (?<name>[^\s]+) bumped to (?<versionRange>[^\s]+)/gm, (...args) =>
            this.#replaceWorkspace(args.at(-1)),
          )
          .replace(/^\s{4}\* (?<name>[^\s]+) bumped from (?:[^\s]+) to (?<versionRange>[^\s]+)/gm, (...args) =>
            this.#replaceWorkspace(args.at(-1)),
          )

        // Find the associated changelog and update that too
        const path = this.#pathsByComponent.get(release.component)
        for (const update of candidate.pullRequest.updates) {
          if (update.path === addPath(path, 'CHANGELOG.md')) {
            update.updater.changelogEntry = release.notes
          }
        }
      }
    }
  }

  // Sort root release to the top of the pull request
  // release please pre sorts based on graph order so
  #sortReleases(candidates) {
    for (const candidate of candidates) {
      candidate.pullRequest.body.releaseData.sort((a, b) => {
        const aPath = this.#pathsByComponent.get(a.component)
        const bPath = this.#pathsByComponent.get(b.component)
        if (aPath === ROOT_PROJECT_PATH) {
          return -1
        }
        if (bPath === ROOT_PROJECT_PATH) {
          return 1
        }
        return localeCompare(aPath, bPath)
      })
    }
  }
}
/* c8 ignore end */
