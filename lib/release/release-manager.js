const core = require('@actions/core')
const { join } = require('path')
const semver = require('semver')
const assert = require('assert')
const dedent = require('dedent')
const mapWorkspaces = require('@npmcli/map-workspaces')
const { request: fetch } = require('undici')
const { getPublishTag, block, noop } = require('./util')

class ReleaseManager {
  #backport
  #cwd
  #defaultTag
  #info
  #lockfile
  #owner
  #pr
  #publish
  #repo
  #token

  constructor({ token, repo, cwd = process.cwd(), pr, backport, defaultTag, lockfile, publish, silent }) {
    assert(token, 'GITHUB_TOKEN is required')
    assert(repo, 'GITHUB_REPOSITORY is required')
    assert(cwd, 'cwd is required')
    assert(pr, 'pr is required')
    assert(defaultTag, 'defaultTag is required')

    this.#backport = backport
    this.#cwd = cwd
    this.#defaultTag = defaultTag
    this.#info = silent ? noop : core.info
    this.#lockfile = lockfile
    this.#owner = repo.split('/')[0]
    this.#pr = pr
    this.#publish = publish
    this.#repo = repo.split('/')[1]
    this.#token = token
  }

  static async run(options) {
    const manager = new ReleaseManager(options)
    return manager.run()
  }

  async run() {
    const { Octokit } = await import('@octokit/rest')
    const octokit = new Octokit({ auth: this.#token })
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: this.#owner,
      repo: this.#repo,
      pull_number: this.#pr,
    })

    const [release, workspaces] = await this.#getPrReleases({ pullRequest })
    const releaseItems = await this.#getReleaseProcess({ release, workspaces })

    this.#info(`Filtered ${releaseItems.length} release process items:`)
    this.#info(releaseItems.map(r => r.split('\n')[0].replace('- [ ] ', '')).join(', '))

    const checklist = releaseItems
      .join('\n\n')
      .replace(/<PR-NUMBER>/g, pullRequest.number)
      .replace(/<RELEASE-BRANCH>/g, pullRequest.head.ref)
      .replace(/<BASE-BRANCH>/g, pullRequest.base.ref)
      .replace(/<MAJOR>/g, release.major)
      .replace(/<X\.Y\.Z>/g, release.version)
      .replace(/<GITHUB-RELEASE-LINK>/g, release.url)
      .replace(/<PUBLISH-FLAGS>/g, release.flags)
      .replace(/^(\s*\S.*)(-w <WS-PKG-N>)$/gm, workspaces.map(w => `$1${w.flags}`).join('\n'))
      .trim()

    return `### Release Checklist for ${release.tag}\n\n${checklist}`
  }

  async #getPrReleases({ pullRequest }) {
    return /<details><summary>.*<\/summary>/.test(pullRequest.body)
      ? await this.#getPrMonoRepoReleases({ pullRequest })
      : [this.#getPrRootRelease({ pullRequest }), []]
  }

  async #getPrMonoRepoReleases({ pullRequest }) {
    const releases = pullRequest.body.match(/<details><summary>.*<\/summary>/g)
    this.#info(`Found ${releases.length} releases`)

    const workspacesComponents = [
      ...(await mapWorkspaces({
        cwd: this.#cwd,
        pkg: require(join(this.#cwd, 'package.json')),
      })),
    ].reduce((acc, [k]) => {
      const wsComponentName = k.startsWith('@') ? k.split('/')[1] : k
      acc[wsComponentName] = k
      return acc
    }, {})

    const MONO_VERSIONS = /<details><summary>(?:(.*?):\s)?(.*?)<\/summary>/

    return releases.reduce(
      (acc, r) => {
        const [, name, version] = r.match(MONO_VERSIONS)

        const release = this.#getPrReleaseInfo({
          pullRequest,
          name,
          version,
          workspaces: workspacesComponents,
        })

        if (release.isRoot) {
          this.#info(`Found root: ${JSON.stringify(release)}`)
          acc[0] = release
        } else {
          this.#info(`Found workspace: ${JSON.stringify(release)}`)
          acc[1].push(release)
        }

        return acc
      },
      [null, []],
    )
  }

  #getPrRootRelease({ pullRequest }) {
    this.#info('Found no monorepo, checking for single root version')

    const match = pullRequest.body.match(/\n##\s\[(.*?)\]/)
    assert(match, 'Could not find single root version in body')

    const version = match[1]
    this.#info(`Found version: ${version}`)

    return this.#getPrReleaseInfo({ pullRequest, version })
  }

  #getPrReleaseInfo({ pullRequest, workspaces = {}, name = null, version: rawVersion }) {
    const version = semver.parse(rawVersion)
    const prerelease = !!version.prerelease.length
    const tag = `${name ? `${name}-` : ''}v${rawVersion}`
    const publishTag = getPublishTag(rawVersion, {
      backport: this.#backport,
      defaultTag: this.#defaultTag,
    })

    return {
      isRoot: !name,
      tag,
      prerelease,
      version: rawVersion,
      major: version.major,
      url: `https://github.com/${pullRequest.base.repo.full_name}/releases/tag/${tag}`,
      flags: [workspaces[name] ? `-w ${workspaces[name]}` : null, `--tag=${publishTag}`].filter(Boolean).join(' '),
    }
  }

  async #getReleaseProcess({ release, workspaces }) {
    const RELEASE_LIST_ITEM = /^\d+\.\s/gm

    this.#info(`Fetching release process from repo wiki: ${this.#owner}/${this.#repo}`)

    const releaseProcess = await fetch(
      `https://raw.githubusercontent.com/wiki/${this.#owner}/${this.#repo}/Release-Process.md`,
    ).then(r => {
      // If the url fails with anything but a 404 we want the process to blow
      // up because that means something is very wrong. This is a rare edge
      // case that isn't worth testing.
      /* istanbul ignore else */
      if (r.statusCode === 200) {
        this.#info('Found release process from wiki')
        return r.body.text()
      } else if (r.statusCode === 404) {
        this.#info('No release process found in wiki, falling back to default process')
        return this.#getReleaseSteps()
      } else {
        throw new Error(`Release process fetch failed with status: ${r.statusCode}`)
      }
    })

    // XXX: the release steps need to always be the last thing in the doc for this to work
    const releaseLines = releaseProcess.split('\n')
    const releaseStartLine = releaseLines.reduce((acc, l, i) => (l.match(/^#+\s/) ? i : acc), 0)
    const section = releaseLines.slice(releaseStartLine).join('\n')

    return section
      .split({
        [Symbol.split]: str => {
          const [, ...matches] = str.split(RELEASE_LIST_ITEM)
          this.#info(`Found ${matches.length} release items`)
          return matches.map(m => `- [ ] <STEP_INDEX>. ${m}`.trim())
        },
      })
      .filter(item => {
        if (release.prerelease && item.includes('> NOT FOR PRERELEASE')) {
          return false
        }

        if (!workspaces.length && item.includes('Publish workspaces')) {
          return false
        }

        return true
      })
      .map((item, index) => item.replace('<STEP_INDEX>', index + 1))
  }

  #getReleaseSteps() {
    const R = `-R ${this.#owner}/${this.#repo}`

    const manualSteps = `
      1. Checkout the release branch and test
  
          ${block('sh')}
          gh pr checkout <PR-NUMBER> --force
          npm ${this.#lockfile ? 'ci' : 'update'}
          npm test
          gh pr checks <PR-NUMBER> ${R} --watch
          ${block()}
  
      1. Publish workspaces
  
          ${block('sh')}
          npm publish -w <WS-PKG-N>
          ${block()}
  
      1. Publish
  
          ${block('sh')}
          npm publish <PUBLISH-FLAGS>
          ${block()}
  
      1. Merge release PR
  
          ${block('sh')}
          gh pr merge <PR-NUMBER> ${R} --squash
          git checkout <BASE-BRANCH>
          git fetch
          git reset --hard origin/<BASE-BRANCH>
          ${block()}
    `

    const autoSteps = `
      1. Approve this PR
  
          ${block('sh')}
          gh pr review <PR-NUMBER> ${R} --approve
          ${block()}
  
      1. Merge release PR :rotating_light: Merging this will auto publish :rotating_light:
  
          ${block('sh')}
          gh pr merge <PR-NUMBER> ${R} --squash
          ${block()}
    `

    /* eslint-disable max-len */
    const alwaysSteps = `
      1. Check For Release Tags
  
          Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.
  
          ${block('sh')}
          gh run watch ${R} $(gh run list ${R} -w release -b <BASE-BRANCH> -L 1 --json databaseId -q ".[0].databaseId")
          ${block()}
    `
    /* eslint-enable max-len */

    return [this.#publish ? autoSteps : manualSteps, alwaysSteps].map(v => dedent(v)).join('\n\n')
  }
}

module.exports = ReleaseManager
