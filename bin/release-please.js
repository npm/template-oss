#!/usr/bin/env node

const core = require('@actions/core')
const main = require('../lib/release-please/index.js')

const dryRun = !process.env.CI
const [branch, eventName] = process.argv.slice(2)

const debugPr = (val) => {
  if (dryRun) {
    console.log('PR:', val.title.toString())
    console.log('='.repeat(40))
    console.log(val.body.toString())
    console.log('='.repeat(40))
    for (const update of val.updates.filter(u => u.updater.changelogEntry)) {
      console.log('CHANGELOG:', update.path)
      console.log('-'.repeat(40))
      console.log(update.updater.changelogEntry)
      console.log('-'.repeat(40))
    }
    for (const update of val.updates.filter(u => u.updater.rawContent)) {
      console.log('package:', update.path)
      console.log('-'.repeat(40))
      console.log(JSON.parse(update.updater.rawContent).name)
      console.log(JSON.parse(update.updater.rawContent).version)
      console.log('-'.repeat(40))
    }
  }
}

main({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  dryRun,
  branch,
  force: eventName === 'workflow_dispatch',
}).then(({ pr, release, releases }) => {
  if (pr) {
    debugPr(pr)
    core.setOutput('pr', JSON.stringify(pr))
    core.setOutput('pr-branch', pr.headBranchName)
    core.setOutput('pr-number', pr.number)
    core.setOutput('pr-sha', pr.sha)
  }

  if (release) {
    core.setOutput('release', JSON.stringify(release))
    core.setOutput('release-path', release.path)
    core.setOutput('release-version', release.version)
    core.setOutput('release-tag', release.tagName)
    core.setOutput('release-url', release.url)
  }

  if (releases) {
    core.setOutput('releases', JSON.stringify(releases))
    core.setOutput('release-flags', JSON.stringify(releases.map((r) => {
      return r.path === '.' ? '-iwr' : `-w ${r.path}`
    })))
  }

  return null
}).catch(err => {
  if (dryRun) {
    console.error(err)
  } else {
    core.setFailed(`failed: ${err}`)
  }
})
