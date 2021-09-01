#!/usr/bin/env node

const check = require('../lib/check.js')

const main = async () => {
  const {
    npm_config_local_prefix: root,
  } = process.env

  if (!root) {
    throw new Error('This package requires npm >7.21.1')
  }

  const problems = await check(root)
  if (problems.length) {
    console.error('Some problems were detected:')
    console.error()
    console.error(problems.map((problem) => problem.message).join('\n'))
    console.error()
    console.error('To correct them:')
    console.error(problems.map((problem) => problem.solution).join('\n'))
    process.exitCode = 1
  }
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
