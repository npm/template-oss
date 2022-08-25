#!/usr/bin/env node

const core = require('@actions/core')
const main = require('../lib/release-please/index.js')

const dryRun = !process.env.CI

const setOutput = (key, val) => {
  if (val && (!Array.isArray(val) || val.length)) {
    if (dryRun) {
      console.log(key, JSON.stringify(val, null, 2))
    } else {
      core.setOutput(key, JSON.stringify(val))
    }
  }
}

main({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  dryRun,
}).then(({ pr, releases, release }) => {
  setOutput('pr', pr)
  setOutput('releases', releases)
  setOutput('release', release)
  return null
}).catch(err => {
  core.setFailed(`failed: ${err}`)
})
