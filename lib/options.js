const { join, posix, win32 } = require('path')
const log = require('proc-log')
const mapWorkspaces = require('@npmcli/map-workspaces')
const { omit, pick } = require('lodash')
const constants = require('./constants.js')
const { resolveConfig } = require('./resolve-config')
const getGitUrl = require('./get-git-url')
const { getData } = require('./data.js')
const { getRules } = require('./rules.js')

const INTERNAL = Symbol('Internal')

const makePosix = (v) => v.split(win32.sep).join(posix.sep)
const posixDir = (v) => `${v === '.' ? '' : deglob(v).replace(/\/$/, '')}${posix.sep}`
const posixGlob = (str) => `${posixDir(str)}**`
const deglob = (v) => {
  let glob = makePosix(v)
  while (glob.endsWith(posix.sep) || glob.endsWith('*')) {
    glob = glob.slice(0, -1)
  }
  return glob
}
const getWorkspaces = async (pkg) => {
  const map = await mapWorkspaces({ pkg: pkg.json, cwd: pkg.path })
  return [...map.entries()]
}

const getPkgOptions = async (path, json, rootPath = path) => {
  const isRoot = rootPath === path
  const isWorkspace = !isRoot

  const isPrivate = !!json.private
  const isPublic = !isPrivate

  const relativeToRoot = (p) => posix.relative(rootPath, p)
  const relativeToPkg = (p) => posix.relative(path, p)

  const relPath = relativeToRoot(path)

  const repository = await getGitUrl(rootPath).then((gitUrl) => gitUrl && {
    type: 'git',
    url: gitUrl,
    ...(!isRoot ? { directory: relPath } : {}),
  })

  return {
    path,
    json,
    isRoot,
    isWorkspace,
    isPrivate,
    isPublic,
    repository,
    // this is all with posix separators for writing to files like
    // workflows which require / as a separator
    relativeToRoot,
    relativeToPkg,
    workspacePaths: (json.workspaces || []).map(deglob),
    workspaceGlobs: (json.workspaces || []).map(posixGlob),
    relPath: relPath || '.',
    relToRoot: relativeToPkg(rootPath),
    dir: posixDir(relPath),
    glob: posixGlob(relPath),
    name: json.name,
    version: json.version,
    nameFs: json.name.replace(/\//g, '-').replace(/@/g, ''),
    flags: isWorkspace ? `--workspace="${json.name}"` : '--include-workspace-root',
  }
}

const getPkg = async (path, rootPath) => {
  log.info('get pkg', path)

  const pkg = await getPkgOptions(path, require(join(path, 'package.json')), rootPath)

  // omit this since it is just used for display in the config
  const rawConfig = omit(pkg.json[constants.configKey] || {}, [
    `//${constants.name}`,
    constants.name,
  ])
  log.info('raw config', rawConfig)

  const resolvedConfig = resolveConfig(path, rawConfig)
  log.info('resolved config', resolvedConfig)

  return {
    ...pkg,
    [INTERNAL]: pick(rawConfig, 'version'),
    config: resolvedConfig,
  }
}

module.exports = async (rootPath, { force }) => {
  const rootPkg = await getPkg(rootPath)
  const wsPkgs = []

  // this is an internal property only to see if we are in the template-oss repo
  // so it is only checked at the root, and inherited by all workspaces
  const isDogFood = rootPkg.json.name === constants.name

  // Look through all workspaces on the root pkg, include all by default
  const allWorkspaces = await getWorkspaces(rootPkg)
  const { workspaces = allWorkspaces, omitWorkspaces = [] } = rootPkg.config
  for (const [wsName, wsPath] of allWorkspaces) {
    if (omitWorkspaces.includes(wsName) || !workspaces.includes(wsName)) {
      continue
    }
    // A workspace can control its own workspaceRepo and workspaceModule settings
    // which are true by default on the root config
    const wsPkg = await getPkg(wsPath, rootPkg.path)
    // workspaces inherit config from the root
    wsPkg.config.unshift(...rootPkg.config)
    wsPkgs.push(wsPkg)
  }

  const pkgs = [rootPkg, ...wsPkgs]
  const options = {
    rootPkg,
    wsPkgs,
    pkgs,
    repo: {
      isMono: !!wsPkgs.length,
      isAllPrivate: wsPkgs.length && !!wsPkgs.find(p => p.isPublic),
      isMonoPublic: pkgs.every(p => p.isPrivate),
      publicPkgs: pkgs.filter(p => !p.isPrivate),
      privatePkgs: pkgs.filter(p => p.isPrivate),
    },
    [INTERNAL]: {
      ...constants,
      isDogFood,
      force,
      needsUpdate: (p) => force || isDogFood || p[INTERNAL].version !== constants.version,
    },
  }

  for (const pkg of pkgs) {
    pkg.data = getData(pkg.config, { ...options, pkg })
  }

  for (const pkg of pkgs) {
    pkg.rules = getRules(pkg, { ...options, pkg })
  }

  return [pkgs, options]
}
