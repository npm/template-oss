const RP = require('release-please')
const { ROOT_PROJECT_PATH } = require('release-please/build/src/manifest.js')
const { CheckpointLogger, logger } = require('release-please/build/src/util/logger.js')
const assert = require('assert')
const core = require('@actions/core')
const omit = require('just-omit')
const ChangelogNotes = require('./changelog.js')
const NodeWorkspaceFormat = require('./node-workspace-format.js')
const { getPublishTag, noop } = require('./util.js')
const { SemverVersioningStrategy } = require('./semver-versioning-strategy.js')

/* istanbul ignore next: TODO fix flaky tests and enable coverage */
class ReleasePlease {
  #token
  #owner
  #repo
  #branch
  #backport
  #defaultTag
  #overrides
  #silent
  #trace
  #info

  #github
  #octokit
  #manifest

  constructor({ token, repo, branch, backport, defaultTag, overrides, silent, trace }) {
    assert(token, 'token is required')
    assert(repo, 'repo is required')
    assert(branch, 'branch is required')
    assert(defaultTag, 'defaultTag is required')

    this.#token = token
    this.#owner = repo.split('/')[0]
    this.#repo = repo.split('/')[1]
    this.#branch = branch
    this.#backport = backport
    this.#defaultTag = defaultTag
    this.#overrides = overrides
    this.#silent = silent
    this.#trace = trace
  }

  static async run(options) {
    const releasePlease = new ReleasePlease(options)
    await releasePlease.init()
    return releasePlease.run()
  }

  async init() {
    RP.registerChangelogNotes('default', ({ github, ...o }) => new ChangelogNotes(github, o))
    RP.registerVersioningStrategy('default', o => new SemverVersioningStrategy(o))
    RP.registerPlugin(
      'node-workspace-format',
      ({ github, targetBranch, repositoryConfig, ...o }) =>
        new NodeWorkspaceFormat(github, targetBranch, repositoryConfig, o),
    )

    if (this.#silent) {
      this.#info = noop
      RP.setLogger(
        Object.entries(logger).reduce((acc, [k, v]) => {
          if (typeof v === 'function') {
            acc[k] = noop
          }
          return acc
        }, {}),
      )
    } else {
      this.#info = core.info
      RP.setLogger(new CheckpointLogger(true, !!this.#trace))
    }

    this.#github = await RP.GitHub.create({
      owner: this.#owner,
      repo: this.#repo,
      token: this.#token,
    })
    this.#octokit = this.#github.octokit
    this.#manifest = await RP.Manifest.fromManifest(this.#github, this.#branch, undefined, undefined, this.#overrides)
  }

  async run() {
    const rootPr = await this.#getRootPullRequest()
    const releases = await this.#getReleases()

    if (rootPr) {
      this.#info(`root pr: ${JSON.stringify(omit(rootPr, 'body'))}`)

      // release please does not guarantee that the release PR will have the latest sha,
      // but we always need it so we can attach the relevant checks to the sha.
      rootPr.sha = await this.#octokit
        .paginate(this.#octokit.rest.pulls.listCommits, {
          owner: this.#owner,
          repo: this.#repo,
          pull_number: rootPr.number,
        })
        .then(r => r[r.length - 1].sha)
    }

    if (releases) {
      this.#info(`found releases: ${releases.length}`)

      for (const release of releases) {
        this.#info(`release: ${JSON.stringify(omit(release, 'notes'))}`)

        release.publishTag = getPublishTag(release.version, {
          backport: this.#backport,
          defaultTag: this.#defaultTag,
        })

        release.prNumber = await this.#octokit.rest.repos
          .listPullRequestsAssociatedWithCommit({
            owner: this.#owner,
            repo: this.#repo,
            commit_sha: release.sha,
            per_page: 1,
          })
          .then(r => r.data[0]?.number)

        release.pkgName = await this.#octokit.rest.repos
          .getContent({
            owner: this.#owner,
            repo: this.#repo,
            ref: this.#branch,
            path: `${release.path === '.' ? '' : release.path}/package.json`,
          })
          .then(r => JSON.parse(Buffer.from(r.data.content, r.data.encoding)).name)
      }
    }

    return {
      pr: rootPr,
      releases: releases,
    }
  }

  async #getRootPullRequest() {
    // We only ever get a single pull request with our current release-please settings
    // Update this if we start creating individual PRs per workspace release
    const pullRequests = await this.#manifest.createPullRequests()
    return pullRequests.filter(Boolean)[0] ?? null
  }

  async #getReleases() {
    // if we have a root release, always put it as the first item in the array
    const rawReleases = await this.#manifest.createReleases().then(r => r.filter(Boolean))
    let rootRelease = null
    const workspaceReleases = []

    for (const release of rawReleases) {
      if (release.path === ROOT_PROJECT_PATH) {
        assert(!rootRelease, 'Multiple root releases detected. This should never happen.')
        rootRelease = release
      } else {
        workspaceReleases.push(release)
      }
    }

    const releases = [rootRelease, ...workspaceReleases].filter(Boolean)
    return releases.length ? releases : null
  }
}

module.exports = ReleasePlease
