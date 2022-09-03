#!/usr/bin/env node

const core = require('@actions/core')
const main = require('../lib/release-please/index.js')

const dryRun = !process.env.CI
const [branch] = process.argv.slice(2)

const setOutput = (key, val) => {
  if (val && (!Array.isArray(val) || val.length)) {
    if (dryRun) {
      if (key === 'pr') {
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
      }
    } else {
      core.setOutput(key, JSON.stringify(val))
    }
  }
}

main({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  dryRun,
  branch,
}).then(({ pr, releases, release }) => {
  setOutput('pr', pr)
  setOutput('releases', releases)
  setOutput('release', release)
  return null
}).catch(err => {
  if (dryRun) {
    console.error(err)
  } else {
    core.setFailed(`failed: ${err}`)
  }
})
