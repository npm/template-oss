#!/usr/bin/env node

const { dirname } = require('path')

const copyContent = require('../lib/content/index.js')
const installPackages = require('../lib/install.js')
const patchPackage = require('../lib/package.js')

const main = async () => {
  const pkgPath = process.env.npm_package_json
  if (!pkgPath) {
    throw new Error('This script must be run as an npm lifecycle event')
  }

  const root = dirname(pkgPath)

  await patchPackage(root)
  await copyContent(root)
  return installPackages(root)
}

// we export the promise so it can be awaited in tests
module.exports = main().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
