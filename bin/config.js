#!/usr/bin/env node

const run = require('../lib/index.js')

const main = async () => {
  const {
    npm_config_global: globalMode,
    npm_config_local_prefix: root,
  } = process.env

  // do nothing in global mode or when the local prefix isn't set
  if (globalMode === 'true' || !root) {
    return
  }

  await run(root, [{
    run: (options) => console.log(JSON.stringify(options, null, 2)),
    when: () => true,
    name: 'get-config',
  }])
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
