const log = require('proc-log')
const PackageJson = require('@npmcli/package-json')
const mapWorkspaces = require('@npmcli/map-workspaces')
const { merge } = require('lodash')
const { getPkgOptions, getRepoOptions } = require('./options.js')
const { getData, getRules } = require('./config.js')
const constants = require('./constants.js')
const { resolveConfigs } = require('./resolve-config')

const prefixLog = (prefix) => log.LEVELS.reduce((acc, k) => {
  acc[k] = (...args) => log[k](prefix, ...args)
  return acc
}, {})

const getPkg = async (path, rootPkg) => {
  const { content: pkg } = await PackageJson.load(path)
  // omit this since it is just used for display in the config
  const {
    [`//${constants.name}`]: _,
    [constants.name]: __,
    ...config
  } = pkg[constants.configKey] || {}

  log.info('get pkg', path, { config })

  const {
    workspaces: configWorkspaces,
    omitWorkspaces: configOmitWorkspaces,
    version: configVersion,
    extends: configExtends = [],
    ...restConfig
  } = config

  return {
    json: pkg, // package json
    path, // path to dir of package.json
    config: [
      ...rootPkg?.config || [],
      ...resolveConfigs({ config: restConfig, path, configExtends }),
    ],
    isDogFood: pkg.name === constants.name,
    needsUpdate: configVersion !== constants.version,
    // config properties that will need to be read before the
    // rest of the arbitrary template oss config
    configWorkspaces,
    configOmitWorkspaces,
    configExtends,
  }
}

const getWsPkgs = async (root, rootPkg) => {
  const wsPkgs = []

  // Include all by default
  const { configWorkspaces, configOmitWorkspaces } = rootPkg
  const includeWs = (name) =>
    Array.isArray(configWorkspaces) ? configWorkspaces.includes(name) : true
  const omitWs = (name) =>
    Array.isArray(configOmitWorkspaces) ? configOmitWorkspaces.includes(name) : false

  // Look through all workspaces on the root pkg
  const rootWorkspaces = await mapWorkspaces({ pkg: rootPkg.json, cwd: root })

  for (const [wsName, wsPath] of rootWorkspaces.entries()) {
    if (includeWs(wsName) && !omitWs(wsName)) {
      // A workspace can control its own workspaceRepo and workspaceModule settings
      // which are true by default on the root config
      wsPkgs.push(await getPkg(wsPath, true))
    }
  }

  return Promise.all(wsPkgs.map(pkg => getPkgOptions({ pkg, rootPkg })))
}

const runAll = async (root, { command, force }) => {
  const results = []

  const rootPkgRaw = await getPkg(root)
  const rootPkg = await getPkgOptions({ pkg: rootPkgRaw, rootPkg: rootPkgRaw })
  const wsPkgs = await getWsPkgs(root, rootPkgRaw)

  const pkgs = [rootPkg].concat(wsPkgs)

  log.verbose('run', { root: rootPkg.path, pkgs: pkgs.map(p => p.path) })

  const repoOptions = getRepoOptions({ wsPkgs, pkgs })

  const makeOptions = (pkg, rootData) => {
    const o = {
      pkg,
      rootPkg,
      repo: repoOptions,
      pkgs,
      wsPkgs,
      // template-oss internal options
      options: {
        ...constants,
        isDogFood: rootPkgRaw.isDogFood,
        needsUpdate: force || rootPkgRaw.isDogFood || pkg.needsUpdate,
      },
    }
    const data = getData(o)
    pkg.data = data
    o.rootPkg.data = rootData ?? data
    return o
  }

  const rootOptions = makeOptions(rootPkg)

  for (const pkg of pkgs) {
    const pkgLog = prefixLog(pkg.name)

    pkgLog.info('run')

    const options = pkg.isRoot ? rootOptions : makeOptions(pkg, rootOptions.pkg.data)
    pkgLog.verbose('options', options)

    const rules = getRules(command, options)
    pkgLog.info('rules', rules.map(r => r.name).join(','))

    // files can export multiple checks so flatten first
    for (const { when, run, name, rule, data: ruleData } of rules.flat()) {
      const ruleLog = prefixLog(`${pkg.name}:${name}`)

      ruleLog.verbose('rule options', rule)

      const getRuleData = (d) => ruleData ? merge({}, d, ruleData(rule, options)) : d

      const ruleOptions = {
        ...options,
        pkg: {
          ...options.pkg,
          data: getRuleData(options.pkg.data),
        },
        rootPkg: {
          ...options.rootPkg,
          data: getRuleData(options.rootPkg.data),
        },
        rule,
        log: ruleLog,
      }

      if (typeof when === 'function') {
        ruleLog.info('attempting to run rule')
        if (!await when(ruleOptions)) {
          ruleLog.info('skipping')
          continue
        }
      }

      ruleLog.info('running')
      const runResults = await run(ruleOptions)
      ruleLog.info('done')

      if (runResults) {
        // checks can return multiple results or nothing
        // so flatten first and remove nulls before returning
        results.push(...[].concat(runResults).flat().filter(Boolean))
      }
    }
  }

  return results
}

module.exports = runAll
