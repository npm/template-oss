const { ManifestPlugin } = require('release-please/build/src/plugin')
const { Changelog } = require('release-please/build/src/updaters/changelog.js')
const { PackageJson } = require('release-please/build/src/updaters/node/package-json.js')

const matchLine = (line, re) => {
  const trimmed = line.trim().replace(/^[*\s]+/, '')
  if (typeof re === 'string') {
    return trimmed === re
  }
  return trimmed.match(re)
}

module.exports = class WorkspaceDeps extends ManifestPlugin {
  run (pullRequests) {
    try {
      for (const { pullRequest } of pullRequests) {
        const getChangelog = (release) => pullRequest.updates.find((u) => {
          const isChangelog = u.updater instanceof Changelog
          const isComponent = release.component && u.path.startsWith(release.component)
          const isRoot = !release.component && !u.path.includes('/')
          return isChangelog && (isComponent || isRoot)
        })

        const getComponent = (pkgName) => pullRequest.updates.find((u) => {
          const isPkg = u.updater instanceof PackageJson
          return isPkg && JSON.parse(u.updater.rawContent).name === pkgName
        }).path.replace(/\/package\.json$/, '')

        const depLinksByComponent = pullRequest.body.releaseData.reduce((acc, release) => {
          if (release.component) {
            const path = [
              this.github.repository.owner,
              this.github.repository.repo,
              'releases',
              'tag',
              release.tag.toString(),
            ]
            acc[release.component] = `https://github.com/${path.join('/')}`
          }
          return acc
        }, {})

        for (const release of pullRequest.body.releaseData) {
          const lines = release.notes.split('\n')
          const newLines = []

          let inWorkspaceDeps = false
          let collectWorkspaceDeps = false

          for (const line of lines) {
            if (matchLine(line, 'The following workspace dependencies were updated')) {
            // We are in the section with our workspace deps
            // Set the flag and discard this line since we dont want it in the final output
              inWorkspaceDeps = true
            } else if (inWorkspaceDeps) {
              if (collectWorkspaceDeps) {
                const depMatch = matchLine(line, /^(\S+) bumped from \S+ to (\S+)$/)
                if (depMatch) {
                // If we have a line that is a workspace dep update, then reformat
                // it and save it to the new lines
                  const [, depName, newVersion] = depMatch
                  const depSpec = `\`${depName}@${newVersion}\``
                  const url = depLinksByComponent[getComponent(depName)]
                  newLines.push(`  * deps: [${depSpec}](${url})`)
                } else {
                // Anything else means we are done with dependencies so ignore
                // this line and dont look for any more
                  collectWorkspaceDeps = false
                }
              } else if (matchLine(line, 'dependencies')) {
              // Only collect dependencies discard dev deps and everything else
                collectWorkspaceDeps = true
              } else if (matchLine(line, '') || matchLine(line, /^#/)) {
                inWorkspaceDeps = false
                newLines.push(line)
              }
            } else {
              newLines.push(line)
            }
          }

          let newNotes = newLines.join('\n').trim()
          const emptyDeps = newNotes.match(/### Dependencies[\n]+(### .*)/m)
          if (emptyDeps) {
            newNotes = newNotes.replace(emptyDeps[0], emptyDeps[1])
          }

          release.notes = newNotes
          getChangelog(release).updater.changelogEntry = newNotes
        }
      }
    } catch {
      // Always return pull requests even if we failed so
      // we dont fail the release
    }

    return pullRequests
  }
}
