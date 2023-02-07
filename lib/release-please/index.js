const RP = require('release-please')
const { CheckpointLogger } = require('release-please/build/src/util/logger.js')
const ChangelogNotes = require('./changelog.js')
const Version = require('./version.js')
const NodeWs = require('./node-workspace.js')

const logger = new CheckpointLogger(true, true)
RP.setLogger(logger)
RP.registerChangelogNotes('default', (o) => new ChangelogNotes(o))
RP.registerVersioningStrategy('default', (o) => new Version(o))
RP.registerPlugin('node-workspace', (o) => new NodeWs(o.github, o.targetBranch, o.repositoryConfig))

const omit = (obj, ...keys) => {
  const res = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      res[key] = value
    }
  }
  return res
}

const getReleaseArtifacts = async ({ dryRun, github, baseBranch }) => {
  // This is mostly for testing and debugging. Use environs with the
  // format `RELEASE_PLEASE_<manfiestOverrideConfigName>` (eg
  // `RELEASE_PLEASE_lastReleaseSha=<SHA>`) to set one-off config items
  // for the release please run without needing to commit and push the config.
  const manifestOverrides = Object.entries(process.env)
    .filter(([k, v]) => k.startsWith('RELEASE_PLEASE_') && v != null)
    .map(([k, v]) => [k.replace('RELEASE_PLEASE_', ''), v])

  const manifest = await RP.Manifest.fromManifest(
    github,
    baseBranch,
    undefined,
    undefined,
    Object.fromEntries(manifestOverrides)
  )

  let pullRequests
  let releases

  if (dryRun) {
    pullRequests = await manifest.buildPullRequests()
    releases = await manifest.buildReleases()
  } else {
    pullRequests = await manifest.createPullRequests()
    releases = await manifest.createReleases()
  }

  return {
    pullRequests: pullRequests.filter(Boolean),
    releases: releases.filter(Boolean),
  }
}

const forcePullRequest = async ({ octokit, owner, repo, baseBranch }) => {
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

const main = async ({ repo: _fullRepo, token, dryRun, branch, force }) => {
  if (!token) {
    throw new Error('Token is required')
  }

  if (!_fullRepo) {
    throw new Error('Repo is required')
  }

  const fullRepo = _fullRepo.split('/')
  const github = await RP.GitHub.create({
    owner: fullRepo[0],
    repo: fullRepo[1],
    token,
  })
  const {
    octokit,
    repository: { owner, repo, defaultBranch },
  } = github

  const baseBranch = branch ?? defaultBranch

  if (force) {
    await forcePullRequest({ octokit, owner, repo, baseBranch })
  }

  const { pullRequests, releases } = await getReleaseArtifacts({ dryRun, github, baseBranch })

  // We only ever get a single pull request with our current release-please settings
  // Update this if we start creating individual PRs per workspace release
  const rootPr = pullRequests[0]
  let rootRelease = releases[0]

  logger.debug(`pull requests: ${pullRequests.length}`)
  logger.debug(`releases: ${releases.length}`)

  if (rootPr) {
    logger.debug(`root pr: ${JSON.stringify(omit(rootPr, 'body'), null, 2)}`)
  }

  if (rootPr?.number) {
    const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: rootPr.number,
    })

    const prSha = commits?.[commits.length - 1]?.sha
    if (!prSha) {
      throw new Error(`Could not find a latest sha for pull request: ${rootPr.number}`)
    }

    rootPr.sha = prSha
  }

  for (const release of releases) {
    const { path, sha } = release
    const prefix = path === '.' ? '' : path
    const isRoot = !prefix
    const packagePath = `${prefix}/package.json`

    logger.debug(`release: ${JSON.stringify({
      ...omit(release, 'notes'),
      isRoot,
      prefix,
    }, null, 2)}`)

    const releasePrNumber = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner,
      repo,
      commit_sha: sha,
      per_page: 1,
    }).then(r => r.data[0]?.number)

    if (!releasePrNumber) {
      throw new Error(`Could not find release PR number from commit: "${sha}"`)
    }

    logger.debug(`pr from ${sha}: ${releasePrNumber}`)

    const releasePkgName = await octokit.rest.repos.getContent({
      owner,
      repo,
      ref: baseBranch,
      path: packagePath,
    }).then(r => {
      try {
        return JSON.parse(Buffer.from(r.data.content, r.data.encoding)).name
      } catch {
        return null
      }
    })

    if (!releasePkgName) {
      throw new Error(`Could not find package name for release at: "${packagePath}#${baseBranch}"`)
    }

    logger.debug(`pkg name from ${packagePath}#${baseBranch}: "${releasePkgName}"`)

    release.prNumber = releasePrNumber
    release.pkgName = releasePkgName
    if (isRoot) {
      rootRelease = release
    }
  }

  return {
    pr: rootPr ?? null,
    release: rootRelease ?? null,
    releases: releases.length ? releases : null,
  }
}

module.exports = main
