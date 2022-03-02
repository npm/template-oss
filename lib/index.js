const log = require('proc-log')
const { defaults } = require('lodash')
const getConfig = require('./config.js')
const PackageJson = require('@npmcli/package-json')
const mapWorkspaces = require('@npmcli/map-workspaces')

const getPkg = async (path, baseConfig) => {
  log.verbose('get-pkg', path)

  const pkg = (await PackageJson.load(path)).content
  const pkgConfig = getConfig.getPkgConfig(pkg)
  log.verbose('get-pkg', pkgConfig)

  return { pkg, path, config: { ...baseConfig, ...pkgConfig } }
}

const getWsPkgs = async (root, rootPkg) => {
  const wsPkgs = []

  // workspaces are only used to filter paths and control changes to workspaces
  // so dont pass it along with the rest of the config
  const { workspaces, ...baseConfig } = rootPkg.config

  // Include all by default
  const include = (name) => Array.isArray(workspaces) ? workspaces.includes(name) : true

  // Look through all workspaces on the root pkg
  const rootWorkspaces = await mapWorkspaces({ pkg: rootPkg.pkg, cwd: root })

  for (const [wsName, wsPath] of rootWorkspaces.entries()) {
    if (include(wsName)) {
      // A workspace can control its own workspaceRepo and workspaceModule settings
      // which are true by default on the root config
      wsPkgs.push(await getPkg(wsPath, baseConfig))
    }
  }

  return {
    pkgs: wsPkgs,
    paths: [...rootWorkspaces.values()],
  }
}

const getPkgs = async (root) => {
  log.verbose('get-pkgs', 'root', root)

  const rootPkg = await getPkg(root)
  const pkgs = [rootPkg]

  defaults(rootPkg.config, {
    rootRepo: true,
    rootModule: true,
    workspaceRepo: true,
    workspaceModule: true,
    workspaces: null,
  })

  const ws = await getWsPkgs(root, rootPkg)

  return {
    pkgs: pkgs.concat(ws.pkgs),
    workspaces: ws.paths,
  }
}

const runAll = async (root, content, checks) => {
  const results = []
  const { pkgs, workspaces } = await getPkgs(root)

  for (const { pkg, path, config } of pkgs) {
    // full config includes original config values
    const fullConfig = await getConfig({
      pkgs,
      workspaces,
      root,
      pkg,
      path,
      config,
      content,
    })

    const options = { root, pkg, path, config: fullConfig }
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
