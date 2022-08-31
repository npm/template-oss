const { ManifestPlugin } = require('release-please/build/src/plugin')

const matchLine = (line, re) => {
  const trimmed = line.trim().replace(/^[*\s]+/, '')
  if (typeof re === 'string') {
    return trimmed === re
  }
  return trimmed.match(re)
}

module.exports = class WorkspaceDeps extends ManifestPlugin {
  run (pullRequests) {
    for (const { pullRequest } of pullRequests) {
      const depLinks = pullRequest.body.releaseData.reduce((acc, release) => {
        if (release.component) {
          const url = matchLine(release.notes.split('\n')[0], /\[[^\]]+\]\((.*?)\)/)
          if (url) {
            acc[release.component] = url[1]
          }
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
                const url = depLinks[depName]
                newLines.push(`  * ${url ? `[${depSpec}](${url})` : depSpec}`)
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

        const newNotes = newLines.join('\n').trim()
        const emptyDeps = newNotes.match(/### Dependencies[\n]+(### .*)/m)

        release.notes = emptyDeps ? newNotes.replace(emptyDeps[0], emptyDeps[1]) : newNotes
      }
    }

    return pullRequests
  }
}
