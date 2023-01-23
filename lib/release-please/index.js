const RP = require('release-please')
const { CheckpointLogger } = require('release-please/build/src/util/logger.js')
const ChangelogNotes = require('./changelog.js')
const Version = require('./version.js')
const NodeWs = require('./node-workspace.js')

RP.setLogger(new CheckpointLogger(true, true))
RP.registerChangelogNotes('default', (o) => new ChangelogNotes(o))
RP.registerVersioningStrategy('default', (o) => new Version(o))
RP.registerPlugin('node-workspace', (o) => new NodeWs(o.github, o.targetBranch, o.repositoryConfig))

const main = async ({ repo: _fullRepo, token, dryRun, branch, force }) => {
  if (!token) {
    throw new Error('Token is required')
  }

  if (!_fullRepo) {
    throw new Error('Repo is required')
  }

  const fullRepo = _fullRepo.split('/')
  const github = await RP.GitHub.create({ owner: fullRepo[0], repo: fullRepo[1], token })
  const {
    octokit,
    repository: { owner, repo, defaultBranch },
  } = github

  // This is mostly for testing and debugging. Use environs with the
  // format `RELEASE_PLEASE_<manfiestOverrideConfigName>` (eg
  // `RELEASE_PLEASE_lastReleaseSha=<SHA>`) to set one-off config items
  // for the release please run without needing to commit and push the config.
  const manifestOverrides = Object.entries(process.env)
    .filter(([k, v]) => k.startsWith('RELEASE_PLEASE_') && v != null)
    .map(([k, v]) => [k.replace('RELEASE_PLEASE_', ''), v])

  const baseBranch = branch ?? defaultBranch

  const manifest = await RP.Manifest.fromManifest(
    github,
    baseBranch,
    undefined,
    undefined,
    Object.fromEntries(manifestOverrides)
  )

  if (force) {
    const { data: releasePrs } = await octokit.pulls.list({
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
    await octokit.pulls.update({
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
    const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: rootPr.number,
    })
    rootPr.sha = commits?.[commits.length - 1]?.sha
  }

  const releases = allReleases.filter(Boolean)
  let rootRelease = releases[0]

  for (const release of releases) {
    const prefix = release.path === '.' ? '' : release.path

    if (!prefix) {
      rootRelease = release
    }

    const [releasePr, releasePkg] = await Promise.all([
      octokit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: release.sha,
      }).then(r => r.data[0]),
      octokit.rest.repos.getContent({
        owner,
        repo,
        ref: baseBranch,
        path: `${prefix}/package.json`,
      }).then(r => JSON.parse(Buffer.from(r.data.content, r.data.encoding))),
    ])

    release.prNumber = releasePr.number
    release.pkgName = releasePkg.name
  }

  return {
    pr: rootPr,
    release: rootRelease,
    releases: releases.length ? releases : null,
  }
}

module.exports = main
