#!/usr/bin/env node

const check = require('../lib/check/index.js')
const output = require('../lib/util/output.js')

const main = async () => {
  const {
    npm_config_local_prefix: root,
  } = process.env

  if (!root) {
    throw new Error('This package requires npm >7.21.1')
  }

  const problems = await check(root)

  if (problems.length) {
    process.exitCode = 1
    console.error(output(problems))
  }
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
