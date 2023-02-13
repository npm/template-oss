const getDefaultConfig = require('@npmcli/template-oss-config')

const { name: NAME, version: VERSION } = require('../../package.json')
const DEFAULT_CONTENT = require.resolve('@npmcli/template-oss-content')
const CONFIG_KEY = 'templateOSS'

const getConfig = async ({
  pkg,
  pkgs,
  rootPkg,
  wsPkgs,
}) => {
  const isLatest = pkg.config.version === VERSION
  const isDogFood = rootPkg.pkgJson.name === NAME
  const isForce = process.argv.includes('--force')

  return {
    ...await getDefaultConfig({
      pkg,
      pkgs,
      rootPkg,
      wsPkgs,
      defaultContent: DEFAULT_CONTENT,
    }),
    __NAME__: NAME,
    __NAME_FS__: NAME.replace(/\//g, '-').replace(/@/g, ''),
    __CONFIG_KEY__: CONFIG_KEY,
    __VERSION__: VERSION,
    // needs update if we are dogfooding this repo, with force argv, or its
    // behind the current version
    needsUpdate: isForce || isDogFood || !isLatest,
    // booleans to control application of updates
    isDogFood,
  }
}

module.exports = {
  getConfig,
  NAME,
  VERSION,
  CONFIG_KEY,
  DEFAULT_CONTENT,
}
