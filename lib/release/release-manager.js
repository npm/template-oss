const { Octokit } = require('@octokit/rest')
const core = require('@actions/core')
const semver = require('semver')
const assert = require('assert')
const dedent = require('dedent')
const mapWorkspaces = require('@npmcli/map-workspaces')
const { getPublishTag } = require('./util')

class ReleaseManager {
  #octokit
  #owner
  #repo
  #cwd
  #pkg
  #pr
  #backport
  #defaultTag
  #lockfile
  #publish

  constructor ({
    token,
    repo,
    cwd,
    pkg,
    pr,
    backport,
    defaultTag,
    lockfile,
    publish,
  }) {
    assert(token, 'GITHUB_TOKEN is required')
    assert(repo, 'GITHUB_REPOSITORY is required')
    assert(cwd, 'cwd is required')
    assert(pkg, 'pkg is required')
    assert(pr, 'pr is required')

    this.#octokit = new Octokit({ auth: token })
    this.#owner = repo.split('/')[0]
    this.#repo = repo.split('/')[1]
    this.#cwd = cwd
    this.#pkg = pkg
    this.#pr = pr
    this.#backport = backport
    this.#defaultTag = defaultTag
    this.#lockfile = lockfile
    this.#publish = publish
  }

  static async run (options) {
    const manager = new ReleaseManager(options)
    return manager.run()
  }

  async run () {
    const { data: pullRequest } = await this.#octokit.rest.pulls.get({
      owner: this.#owner,
      repo: this.#repo,
      pull_number: this.#pr,
    })

    const [release, workspaces = []] = await this.#getPrReleases({ pullRequest })
    const releaseItems = await this.#getReleaseProcess({ release, workspaces })

    core.info(`Filtered ${releaseItems.length} release process items:`)
    core.info(releaseItems.map(r => r.split('\n')[0].replace('- [ ] ', '')).join(', '))

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

  async #getPrReleases ({ pullRequest }) {
    const RELEASE_SEPARATOR = /<details><summary>.*<\/summary>/g
    const MONO_VERSIONS = /<details><summary>(?:(.*?):\s)?(.*?)<\/summary>/
    const ROOT_VERSION = /\n##\s\[(.*?)\]/

    const workspaces = [...await mapWorkspaces({ pkg: this.#pkg, cwd: this.#cwd })]
      .reduce((acc, [k]) => {
        const wsComponentName = k.startsWith('@') ? k.split('/')[1] : k
        acc[wsComponentName] = k
        return acc
      }, {})

    const getReleaseInfo = ({ name, version: rawVersion }) => {
      const version = semver.parse(rawVersion)
      const prerelease = !!version.prerelease.length
      const tag = `${name ? `${name}-` : ''}v${rawVersion}`
      const workspace = workspaces[name]
      const publishTag = getPublishTag(rawVersion, {
        backport: this.#backport,
        defaultTag: this.#defaultTag,
      })

      return {
        name,
        tag,
        prerelease,
        version: rawVersion,
        major: version.major,
        url: `https://github.com/${pullRequest.base.repo.full_name}/releases/tag/${tag}`,
        flags: `${name ? `-w ${workspace}` : ''} --tag=${publishTag}`.trim(),
      }
    }

    const releases = pullRequest.body.match(RELEASE_SEPARATOR)

    if (!releases) {
      core.info('Found no monorepo, checking for single root version')
      const [, version] = pullRequest.body.match(ROOT_VERSION) || []

      if (!version) {
        throw new Error('Could not find version with:', ROOT_VERSION)
      }

      core.info(`Found version: ${version}`)
      return [getReleaseInfo({ version })]
    }

    core.info(`Found ${releases.length} releases`)

    return releases.reduce((acc, r) => {
      const [, name, version] = r.match(MONO_VERSIONS)
      const release = getReleaseInfo({ name, version })

      if (!name) {
        core.info(`Found root: ${JSON.stringify(release)}`)
        acc[0] = release
      } else {
        core.info(`Found workspace: ${JSON.stringify(release)}`)
        acc[1].push(release)
      }

      return acc
    }, [null, []])
  }

  async #getReleaseProcess ({ release, workspaces }) {
    const RELEASE_LIST_ITEM = /^\d+\.\s/gm

    core.info(`Fetching release process from repo wiki: ${this.#owner}/${this.#repo}`)

    const releaseProcess = await fetch(
      `https://raw.githubusercontent.com/wiki/${this.#owner}/${this.#repo}/Release-Process.md`
    )
      .then(r => {
        if (r.status === 200) {
          core.info('Found release process from wiki')
          return r.text()
        } else if (r.status === 404) {
          core.info('No release process found in wiki, falling back to default process')
          return this.#getReleaseSteps()
        } else {
          throw new Error(`Release process fetch failed with status: ${r.status}`)
        }
      })

    // XXX: the release steps need to always be the last thing in the doc for this to work
    const releaseLines = releaseProcess.split('\n')
    const releaseStartLine = releaseLines.reduce((acc, l, i) => l.match(/^#+\s/) ? i : acc, 0)
    const section = releaseLines.slice(releaseStartLine).join('\n')

    return section
      .split({
        [Symbol.split] (str) {
          const [, ...matches] = str.split(RELEASE_LIST_ITEM)
          core.info(`Found ${matches.length} release items`)
          return matches.map((m) => `- [ ] <STEP_INDEX>. ${m}`.trim())
        },
      })
      .filter((item) => {
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

  #getReleaseSteps () {
    const R = `-R ${this.#owner}/${this.#repo}`
    /* eslint-disable max-len */
    const MANUAL_PUBLISH_STEPS = dedent`
      1. Checkout the release branch and test
  
          \`\`\`sh
          gh pr checkout <PR-NUMBER> --force
          npm ${this.#lockfile ? 'ci' : 'update'}
          npm test
          gh pr checks <PR-NUMBER> ${R} --watch
          \`\`\`
  
      1. Publish workspaces
  
          \`\`\`sh
          npm publish -w <WS-PKG-N>
          \`\`\`
  
      1. Publish
  
          \`\`\`sh
          npm publish <PUBLISH-FLAGS>
          \`\`\`
  
      1. Merge release PR
  
          \`\`\`sh
          gh pr merge <PR-NUMBER> ${R} --rebase
          git checkout <BASE-BRANCH>
          git fetch
          git reset --hard origin/<BASE-BRANCH>
          \`\`\`
    `

    const AUTO_PUBLISH_STEPS = dedent`
      1. Approve this PR
  
          \`\`\`sh
          gh pr review <PR-NUMBER> ${R} --approve
          \`\`\`
  
      1. Merge release PR :rotating_light: Merging this will auto publish :rotating_light:
  
          \`\`\`sh
          gh pr merge <PR-NUMBER> ${R} --rebase
          \`\`\`
    `

    return (this.#publish ? AUTO_PUBLISH_STEPS : MANUAL_PUBLISH_STEPS) + dedent`
      1. Check For Release Tags
  
          Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.
  
          \`\`\`
          gh run watch ${R} $(gh run list ${R} -w release -b <BASE-BRANCH> -L 1 --json databaseId -q ".[0].databaseId")
          \`\`\`
    `
    /* eslint-enable max-len */
  }
}

module.exports = ReleaseManager
