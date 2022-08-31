const RP = require('release-please')
const logger = require('./logger.js')
const ChangelogNotes = require('./changelog.js')
const Version = require('./version.js')
const WorkspaceDeps = require('./workspace-deps.js')

RP.setLogger(logger)
RP.registerChangelogNotes('default', (options) => new ChangelogNotes(options))
RP.registerVersioningStrategy('default', (options) => new Version(options))
RP.registerPlugin('workspace-deps', (options) => new WorkspaceDeps(options))

const main = async ({ repo: fullRepo, token, dryRun, branch }) => {
  if (!token) {
    throw new Error('Token is required')
  }

  if (!fullRepo) {
    throw new Error('Repo is required')
  }

  const [owner, repo] = fullRepo.split('/')
  const github = await RP.GitHub.create({ owner, repo, token })
  const manifest = await RP.Manifest.fromManifest(
    github,
    branch ?? github.repository.defaultBranch
  )

  const pullRequests = await (dryRun ? manifest.buildPullRequests() : manifest.createPullRequests())
  const releases = await (dryRun ? manifest.buildReleases() : manifest.createReleases())

  return {
    // We only ever get a single pull request with our current release-please settings
    pr: pullRequests.filter(Boolean)[0],
    releases: releases.filter(Boolean),
    release: releases.find(r => r.path === '.'),
  }
}

module.exports = main
