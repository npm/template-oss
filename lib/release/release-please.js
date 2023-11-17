const {
  Manifest,
  GitHub,
  registerChangelogNotes,
  registerVersioningStrategy,
  registerPlugin,
} = require('release-please')
const assert = require('assert')
const core = require('@actions/core')
const omit = require('just-omit')
const ChangelogNotes = require('./changelog.js')
const Version = require('./version.js')
const NodeWs = require('./node-workspace.js')
const { getPublishTag } = require('./util.js')

class ReleasePlease {
  #token
  #owner
  #repo
  #branch
  #backport
  #defaultTag
  #overrides

  #github
  #octokit
  #manifest

  constructor ({
    token,
    repo,
    branch,
    backport,
    defaultTag,
    overrides,
  }) {
    assert(token, 'token is required')
    assert(repo, 'repo is required')
    assert(branch, 'branch is required')

    this.#token = token
    this.#owner = repo.split('/')[0]
    this.#repo = repo.split('/')[1]
    this.#branch = branch
    this.#backport = backport
    this.#defaultTag = defaultTag
    this.#overrides = overrides
  }

  static async run (options) {
    const releasePlease = new ReleasePlease(options)
    await releasePlease.init()
    return releasePlease.run()
  }

  async init () {
    registerChangelogNotes('default', ({ github, ...options }) =>
      new ChangelogNotes(github, options))
    registerVersioningStrategy('default', ({ github, ...options }) =>
      new Version(github, options))
    registerPlugin('node-workspace', ({ github, targetBranch, repositoryConfig, ...options }) =>
      new NodeWs(github, targetBranch, repositoryConfig, options))

    this.#github = await GitHub.create({
      owner: this.#owner,
      repo: this.#repo,
      token: this.#token,
    })
    this.#octokit = this.#github.octokit
    this.#manifest = await Manifest.fromManifest(
      this.#github,
      this.#branch,
      undefined,
      undefined,
      this.#overrides
    )
  }

  async run () {
    const rootPr = await this.#getRootPullRequest()
    const releases = await this.#getReleases()

    if (rootPr) {
      core.info(`root pr: ${JSON.stringify(omit(rootPr, 'body'), null, 2)}`)

      // release please does not guarantee that the release PR will have the latest sha,
      // but we always need it so we can attach the relevant checks to the sha.
      rootPr.sha = await this.#octokit.paginate(this.#octokit.rest.pulls.listCommits, {
        owner: this.#owner,
        repo: this.#repo,
        pull_number: rootPr.number,
      }).then(r => r[r.length - 1].sha)
    }

    if (releases) {
      core.info(`found releases: ${releases.length}`)

      for (const release of releases) {
        core.info(`release: ${JSON.stringify(omit(release, 'notes'), null, 2)}`)

        release.publishTag = getPublishTag(release.version, {
          backport: this.#backport,
          defaultTag: this.#defaultTag,
        })

        release.prNumber = await this.#octokit.rest.repos.listPullRequestsAssociatedWithCommit({
          owner: this.#owner,
          repo: this.#repo,
          commit_sha: release.sha,
          per_page: 1,
        }).then(r => r.data[0]?.number)

        release.pkgName = await this.#octokit.rest.repos.getContent({
          owner: this.#owner,
          repo: this.#repo,
          ref: this.#branch,
          path: `${release.path === '.' ? '' : release.path}/package.json`,
        }).then(r => JSON.parse(Buffer.from(r.data.content, r.data.encoding)).name)
      }
    }

    return {
      pr: rootPr,
      releases: releases,
    }
  }

  async #getRootPullRequest () {
    // We only ever get a single pull request with our current release-please settings
    // Update this if we start creating individual PRs per workspace release
    const pullRequests = await this.#manifest.createPullRequests()
    return pullRequests.filter(Boolean)[0] ?? null
  }

  async #getReleases () {
    // if we have a root release, always put it as the first item in the array
    const rawReleases = await this.#manifest.createReleases().then(r => r.filter(Boolean))
    let rootRelease = null
    const workspaceReleases = []

    for (const release of rawReleases) {
      if (!rootRelease && release.path === '.') {
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
