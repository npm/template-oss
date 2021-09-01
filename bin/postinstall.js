#!/usr/bin/env node

const copyContent = require('../lib/content/index.js')
const installPackages = require('../lib/install.js')
const patchPackage = require('../lib/package.js')

const main = async () => {
  const {
    npm_config_global: globalMode,
    npm_config_local_prefix: root,
  } = process.env

  // do nothing in global mode or when the local prefix isn't set
  if (globalMode === 'true' || !root) {
    return
  }

  const needsAction = await patchPackage(root)
  if (!needsAction) {
    return
  }

  await copyContent(root)
  return installPackages(root)
}

// we export the promise so it can be awaited in tests, coverage is disabled
// for the catch handler because it does so little it's not worth testing
module.exports = main().catch(/* istanbul ignore next */ (err) => {
  console.error(err.stack)
  process.exitCode = 1
})
