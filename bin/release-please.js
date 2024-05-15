#!/usr/bin/env node

const core = require('@actions/core')
const { parseArgs } = require('util')
const ReleasePlease = require('../lib/release/release-please.js')

ReleasePlease.run({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  ...parseArgs({
    options: {
      branch: { type: 'string' },
      backport: { type: 'string' },
      defaultTag: { type: 'string' },
    },
  }).values,
  // This is mostly for testing and debugging. Use environs with the format
  // `RELEASE_PLEASE_<manfiestOverrideConfigName>`
  // (eg`RELEASE_PLEASE_lastReleaseSha=<SHA>`) to set one-off config items for
  // the release please run without needing to commit and push the config.
  overrides: Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => k.startsWith('RELEASE_PLEASE_') && v != null)
      .map(([k, v]) => [k.replace('RELEASE_PLEASE_', ''), v]),
  ),
})
  .then(({ pr, releases }) => {
    if (pr) {
      core.setOutput('pr', JSON.stringify(pr))
      core.setOutput('pr-branch', pr.headBranchName)
      core.setOutput('pr-number', pr.number)
      core.setOutput('pr-sha', pr.sha)
    }

    if (releases) {
      core.setOutput('releases', JSON.stringify(releases))
    }

    return null
  })
  .catch(err => {
    core.setFailed('Release Please failed')
    core.error(err)
  })
