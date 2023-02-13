const log = require('proc-log')
const { resolve } = require('path')
const getConfig = require('@npmcli/template-oss-config')
const PackageJson = require('@npmcli/package-json')
const mapWorkspaces = require('@npmcli/map-workspaces')

const getPkg = async (path) => {
  log.verbose('get-pkg', path)

  const pkgJson = (await PackageJson.load(path)).content
  const pkgConfig = getConfig.getPkgConfig(pkgJson)
  log.verbose('get-pkg', pkgConfig)

  if (pkgConfig.content) {
    pkgConfig.content = resolve(path, pkgConfig.content)
  }

  return {
    pkgJson,
    path,
    config: pkgConfig,
  }
}

const getWsPkgs = async (root, rootPkg) => {
  const wsPkgs = []

  // Include all by default
  const { workspaces } = rootPkg.config
  const include = (name) => Array.isArray(workspaces) ? workspaces.includes(name) : true

  // Look through all workspaces on the root pkg
  const rootWorkspaces = await mapWorkspaces({ pkg: rootPkg.pkgJson, cwd: root })

  for (const [wsName, wsPath] of rootWorkspaces.entries()) {
    if (include(wsName)) {
      // A workspace can control its own workspaceRepo and workspaceModule settings
      // which are true by default on the root config
      wsPkgs.push(await getPkg(wsPath))
    }
  }

  return wsPkgs
}

const getPkgs = async (root) => {
  log.verbose('get-pkgs', 'root', root)

  const rootPkg = await getPkg(root)

  const wsPkgs = await getWsPkgs(root, rootPkg)

  return {
    rootPkg,
    wsPkgs,
    pkgs: [rootPkg].concat(wsPkgs),
  }
}

const runAll = async (root, checks) => {
  const results = []
  const { pkgs, rootPkg, wsPkgs } = await getPkgs(root)

  const fullRootConfig = await getConfig({
    pkg: rootPkg,
    pkgs,
    rootPkg,
    wsPkgs,
  })

  for (const pkg of pkgs) {
    // full config includes original config values
    const fullConfig = await getConfig({
      pkg,
      pkgs,
      rootPkg,
      wsPkgs,
    })

    const options = {
      root,
      path: pkg.path,
      pkg: pkg.pkgJson,
      config: fullConfig,
      rootConfig: fullRootConfig,
    }
    log.verbose('run-all', options)

    // files can export multiple checks so flatten first
    for (const { when, run, name } of checks.flat()) {
      log.info('attempting to run', name)
      if (await when(options)) {
        log.info('running', name)
        results.push(await run(options))
      }
    }
  }

  // checks can return multiple results or nothing
  // so flatten first and remove nulls before returning
  return results.flat().filter(Boolean)
}

module.exports = runAll
