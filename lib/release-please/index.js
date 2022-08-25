const { Manifest, GitHub, registerChangelogNotes, setLogger } = require('release-please')
const { CheckpointLogger } = require('release-please/build/src/util/logger')
const ChangelogNotes = require('./changelog')

setLogger(new CheckpointLogger(true, true))
registerChangelogNotes('default', (options) => new ChangelogNotes(options))

const main = async ({ repo: fullRepo, token, dryRun }) => {
  if (!token) {
    throw new Error('Token is required')
  }

  if (!fullRepo) {
    throw new Error('Repo is required')
  }

  const [owner, repo] = fullRepo.split('/')
  const github = await GitHub.create({ owner, repo, token })
  const manifest = await Manifest.fromManifest(
    github,
    github.repository.defaultBranch
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
