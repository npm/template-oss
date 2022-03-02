#!/usr/bin/env node

const apply = require('../lib/apply/index.js')

const main = async () => {
  const {
    npm_config_global: globalMode,
    npm_config_local_prefix: root,
  } = process.env

  // do nothing in global mode or when the local prefix isn't set
  if (globalMode === 'true' || !root) {
    return
  }

  await apply(root)
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
