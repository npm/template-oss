#!/usr/bin/env node

const run = require('../lib/index.js')
const cli = require('../lib/cli.js')

cli(async (opts) => {
  const problems = await run(opts.root, {
    ...opts,
    command: 'check',
  })

  if (problems.length) {
    process.exitCode = 1
    return { check: problems }
  }
})
