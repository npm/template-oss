#!/usr/bin/env node

const { Octokit } = require('@octokit/rest')
const semver = require('semver')
const mapWorkspaces = require('@npmcli/map-workspaces')
const { join } = require('path')

const log = (...logs) => console.error('LOG', ...logs)

const ROOT = process.cwd()
const pkg = require(join(ROOT, 'package.json'))

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace(/^--/g, '').split('=')
  acc[k] = v === 'true'
  return acc
}, {})

/* eslint-disable max-len */
const MANUAL_PUBLISH_STEPS = `
1. Checkout the release branch and test

    \`\`\`sh
    gh pr checkout <PR-NUMBER> --force
    npm ${args.lockfile ? 'ci' : 'update'}
    npm test
    gh pr checks <PR-NUMBER> -R {NWO} --watch
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
    gh pr merge <PR-NUMBER> -R {NWO} --rebase
    git checkout <BASE-BRANCH>
    git fetch
    git reset --hard origin/<BASE-BRANCH>
    \`\`\`
`

const AUTO_PUBLISH_STEPS = `
1. Approve this PR

    \`\`\`sh
    gh pr review <PR-NUMBER> -R {NWO} --approve
    \`\`\`

1. Merge release PR :rotating_light: Merging this will auto publish :rotating_light:

    \`\`\`sh
    gh pr merge <PR-NUMBER> -R {NWO} --rebase
    \`\`\`
`

const DEFAULT_RELEASE_PROCESS = (args.publish ? AUTO_PUBLISH_STEPS : MANUAL_PUBLISH_STEPS) + `
1. Check For Release Tags

    Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.

    \`\`\`
    gh run watch -R {NWO} $(gh run list -R {NWO} -w release -b <BASE-BRANCH> -L 1 --json databaseId -q ".[0].databaseId")
    \`\`\`
`
/* eslint-enable max-len */

const getReleaseProcess = async ({ owner, repo }) => {
  const RELEASE_LIST_ITEM = /^\d+\.\s/gm

  log(`Fetching release process from:`, owner, repo, 'wiki')

  let releaseProcess = ''
  try {
    releaseProcess = await new Promise((resolve, reject) => {
      require('https')
        .get(`https://raw.githubusercontent.com/wiki/${owner}/${repo}/Release-Process.md`, resp => {
          let d = ''
          resp.on('data', c => (d += c))
          resp.on('end', () => {
            if (resp.statusCode !== 200) {
              reject(new Error(`${resp.req.protocol + resp.req.host + resp.req.path}: ${d}`))
            } else {
              resolve(d)
            }
          })
        })
        .on('error', reject)
    })
  } catch (e) {
    log('Release wiki not found', e.message)
    log('Using default release process')
    releaseProcess = DEFAULT_RELEASE_PROCESS.replace(/\{NWO\}/g, `${owner}/${repo}`).trim() + '\n'
  }

  // XXX: the release steps need to always be the last thing in the doc for this to work
  const releaseLines = releaseProcess.split('\n')
  const releaseStartLine = releaseLines.reduce((acc, line, index) =>
    line.match(/^#+\s/) ? index : acc, 0)
  const section = releaseLines.slice(releaseStartLine).join('\n')

  return section.split({
    [Symbol.split] (str) {
      const [, ...matches] = str.split(RELEASE_LIST_ITEM)
      log(`Found ${matches.length} release items`)
      return matches.map((m) => `- [ ] <STEP_INDEX>. ${m}`.trim())
    },
  })
}

const getPrReleases = async (pr) => {
  const RELEASE_SEPARATOR = /<details><summary>.*<\/summary>/g
  const MONO_VERSIONS = /<details><summary>(?:(.*?):\s)?(.*?)<\/summary>/
  const ROOT_VERSION = /\n##\s\[(.*?)\]/

  const workspaces = [...await mapWorkspaces({ pkg: pkg, cwd: ROOT })].reduce((acc, [k]) => {
    const wsComponentName = k.startsWith('@') ? k.split('/')[1] : k
    acc[wsComponentName] = k
    return acc
  }, {})

  const getReleaseInfo = ({ name, version: rawVersion }) => {
    const version = semver.parse(rawVersion)
    const prerelease = !!version.prerelease.length
    const tag = `${name ? `${name}-` : ''}v${rawVersion}`
    const workspace = workspaces[name]

    return {
      name,
      tag,
      prerelease,
      version: rawVersion,
      major: version.major,
      url: `https://github.com/${pr.base.repo.full_name}/releases/tag/${tag}`,
      flags: `${name ? `-w ${workspace}` : ''} ${prerelease ? `--tag prerelease` : ''}`.trim(),
    }
  }

  const releases = pr.body.match(RELEASE_SEPARATOR)

  if (!releases) {
    log('Found no monorepo, checking for single root version')
    const [, version] = pr.body.match(ROOT_VERSION) || []

    if (!version) {
      throw new Error('Could not find version with:', ROOT_VERSION)
    }

    log('Found version', version)
    return [getReleaseInfo({ version })]
  }

  log(`Found ${releases.length} releases`)

  return releases.reduce((acc, r) => {
    const [, name, version] = r.match(MONO_VERSIONS)
    const release = getReleaseInfo({ name, version })

    if (!name) {
      log('Found root', release)
      acc[0] = release
    } else {
      log('Found workspace', release)
      acc[1].push(release)
    }

    return acc
  }, [null, []])
}

const appendToComment = async ({ github, commentId, title, body }) => {
  if (!commentId) {
    log(`No comment id, skipping append to comment`)
    return
  }

  const { data: comment } = await github.rest.issues.getComment({
    ...github.repo,
    comment_id: commentId,
  })

  const hasAppended = comment.body.includes(title)

  log('Found comment with id:', commentId)
  log(hasAppended ? 'Comment has aready been appended, replacing' : 'Appending to comment')

  const prefix = hasAppended
    ? comment.body.split(title)[0]
    : comment.body

  return github.rest.issues.updateComment({
    ...github.repo,
    comment_id: commentId,
    body: [prefix, title, body].join('\n\n'),
  })
}

const main = async (env) => {
  // These env vars are set by the release.yml workflow from template-oss
  const {
    CI,
    GITHUB_TOKEN,
    GITHUB_REPOSITORY,
    RELEASE_PR_NUMBER,
    RELEASE_COMMENT_ID, // comment is optional for testing
  } = env

  if (!CI || !GITHUB_TOKEN || !GITHUB_REPOSITORY || !RELEASE_PR_NUMBER) {
    throw new Error('This script is designed to run in CI. If you want to test it, set the ' +
      `following env vars: \`CI, GITHUB_TOKEN, GITHUB_REPOSITORY, RELEASE_PR_NUMBER\``)
  }

  const [owner, repo] = GITHUB_REPOSITORY.split('/')
  const github = new Octokit({ auth: GITHUB_TOKEN })
  github.repo = { owner, repo }

  const { data: pr } = await github.rest.pulls.get({
    ...github.repo,
    pull_number: RELEASE_PR_NUMBER,
  })

  const [release, workspaces = []] = await getPrReleases(pr)

  const RELEASE_OMIT_PRERELEASE = '> NOT FOR PRERELEASE'
  const RELEASE_OMIT_WORKSPACES = 'Publish workspaces'
  const releaseItems = (await getReleaseProcess({ owner, repo }))
    .filter((item) => {
      if (release.prerelease && item.includes(RELEASE_OMIT_PRERELEASE)) {
        return false
      }

      if (!workspaces.length && item.includes(RELEASE_OMIT_WORKSPACES)) {
        return false
      }

      return true
    })
    .map((item, index) => item.replace('<STEP_INDEX>', index + 1))

  log(
    `Filtered ${releaseItems.length} release process items:\n`,
    releaseItems.map(r => r.split('\n')[0].replace('- [ ] ', '')).join(', ')
  )

  const releaseTitle = `### Release Checklist for ${release.tag}`
  const releaseChecklist = releaseItems
    .join('\n\n')
    .replace(/<PR-NUMBER>/g, RELEASE_PR_NUMBER)
    .replace(/<RELEASE-BRANCH>/g, pr.head.ref)
    .replace(/<BASE-BRANCH>/g, pr.base.ref)
    .replace(/<MAJOR>/g, release.major)
    .replace(/<X\.Y\.Z>/g, release.version)
    .replace(/<GITHUB-RELEASE-LINK>/g, release.url)
    .replace(/<PUBLISH-FLAGS>/g, release.flags)
    .replace(/^(\s*\S.*)(-w <WS-PKG-N>)$/gm, workspaces.map(w => `$1${w.flags}`).join('\n'))
    .trim()

  await appendToComment({
    github,
    commentId: RELEASE_COMMENT_ID,
    title: releaseTitle,
    body: releaseChecklist,
  })

  if (!RELEASE_COMMENT_ID) {
    console.log(releaseChecklist)
  }
}

main(process.env)
  // This is part of the release CI and is for posting a release manager
  // comment to the issue but we dont want it to ever fail the workflow so
  // just log but dont set the error code
  .catch(err => console.error(err))
