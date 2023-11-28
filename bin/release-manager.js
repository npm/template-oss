#!/usr/bin/env node

const core = require('@actions/core')
const { parseArgs } = require('util')
const ReleaseManager = require('../lib/release/release-manager')

ReleaseManager.run({
  // These env vars are set by the release.yml workflow from template-oss
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  cwd: process.cwd(),
  ...parseArgs({
    options: {
      pr: { type: 'string' },
      backport: { type: 'string' },
      defaultTag: { type: 'string' },
      lockfile: { type: 'boolean' },
      publish: { type: 'boolean' },
    },
  }).values,
})
  .then((result) => {
    core.setOutput('result', result)
    return null
  })
  .catch(err => {
    core.setFailed('Release Manager failed')
    core.error(err)
  })
