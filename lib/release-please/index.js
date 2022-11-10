const RP = require('release-please')
const { CheckpointLogger } = require('release-please/build/src/util/logger.js')
const ChangelogNotes = require('./changelog.js')
const Version = require('./version.js')
const NodeWs = require('./node-workspace.js')

RP.setLogger(new CheckpointLogger(true, true))
RP.registerChangelogNotes('default', (o) => new ChangelogNotes(o))
RP.registerVersioningStrategy('default', (o) => new Version(o))
RP.registerPlugin('node-workspace', (o) => new NodeWs(o.github, o.targetBranch, o.repositoryConfig))

const main = async ({ repo: fullRepo, token, dryRun, branch, force }) => {
  if (!token) {
    throw new Error('Token is required')
  }

  if (!fullRepo) {
    throw new Error('Repo is required')
  }

  const [owner, repo] = fullRepo.split('/')
  const github = await RP.GitHub.create({ owner, repo, token })

  // This is mostly for testing and debugging. Use environs with the
  // format `RELEASE_PLEASE_<manfiestOverrideConfigName>` (eg
  // `RELEASE_PLEASE_lastReleaseSha=<SHA>`) to set one-off config items
  // for the release please run without needing to commit and push the config.
  const manifestOverrides = Object.entries(process.env)
    .filter(([k, v]) => k.startsWith('RELEASE_PLEASE_') && v != null)
    .map(([k, v]) => [k.replace('RELEASE_PLEASE_', ''), v])

  const baseBranch = branch ?? github.repository.defaultBranch

  const manifest = await RP.Manifest.fromManifest(
    github,
    baseBranch,
    undefined,
    undefined,
    Object.fromEntries(manifestOverrides)
  )

  if (force) {
    const { data: releasePrs } = await github.octokit.pulls.list({
      owner,
      repo,
      head: `release-please--branches--${baseBranch}`,
    })

    if (releasePrs.length !== 1) {
      throw new Error(`Found ${releasePrs.length} matching PRs, expected 1`)
    }

    const [releasePr] = releasePrs
    const id = process.env.GITHUB_RUN_ID
      ? `by https://github.com/${owner}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : `manually starting at ${new Date().toJSON()}`

    // XXX(hack): to get release please to recreate a pull request it needs
    // to have a different body string so we append a message a message that CI
    // is running. This will force release-please to rebase the PR but it
    // wont update the body again, so we only append to it.
    await github.octokit.pulls.update({
      owner,
      repo,
      pull_number: releasePr.number,
      body: `${releasePr.body.trim()}\n- This PR is being recreated ${id}`,
    })
  }

  const pullRequests = await (dryRun ? manifest.buildPullRequests() : manifest.createPullRequests())
  const allReleases = await (dryRun ? manifest.buildReleases() : manifest.createReleases())

  // We only ever get a single pull request with our current release-please settings
  const rootPr = pullRequests.filter(Boolean)?.[0]
  if (rootPr?.number) {
    const commits = await github.octokit.paginate(github.octokit.rest.pulls.listCommits, {
      owner: github.repository.owner,
      repo: github.repository.repo,
      pull_number: rootPr.number,
    })
    rootPr.sha = commits?.[commits.length - 1]?.sha
  }

  const releases = allReleases.filter(Boolean)
  const [rootRelease, workspaceReleases] = releases.reduce((acc, r) => {
    if (r.path === '.') {
      acc[0] = r
    } else {
      acc[1].push(r)
    }
    return acc
  }, [null, []])

  return {
    pr: rootPr,
    release: rootRelease,
    releases: releases.length ? releases : null,
    workspaceReleases: workspaceReleases.length ? workspaceReleases : null,
  }
}

module.exports = main
