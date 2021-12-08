#!/usr/bin/env node

const copyContent = require('../lib/postinstall/copy-content.js')
const patchPackage = require('../lib/postinstall/update-package.js')
const getConfig = require('../lib/config.js')

const main = async () => {
  const {
    npm_config_global: globalMode,
    npm_config_local_prefix: root,
  } = process.env

  // do nothing in global mode or when the local prefix isn't set
  if (globalMode === 'true' || !root) {
    return
  }

  const config = await getConfig(root)
  for (const path of config.paths) {
    if (!await patchPackage(path, root, config)) {
      continue
    }

    await copyContent(path, root, config)
  }
}

module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
