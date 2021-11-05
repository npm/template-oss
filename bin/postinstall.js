#!/usr/bin/env node

const copyContent = require('../lib/postinstall/copy-content.js')
const patchPackage = require('../lib/postinstall/update-package.js')

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
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
