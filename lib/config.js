const { relative, dirname, join, extname, posix, win32 } = require('path')
const { defaults, pick, omit, uniq } = require('lodash')
const semver = require('semver')
const parseCIVersions = require('./util/parse-ci-versions.js')
const getGitUrl = require('./util/get-git-url.js')
const gitignore = require('./util/gitignore.js')
const { withArrays } = require('./util/merge.js')
const { FILE_KEYS, parseConfig: parseFiles, getAddedFiles } = require('./util/files.js')

const CONFIG_KEY = 'templateOSS'
const getPkgConfig = (pkg) => pkg[CONFIG_KEY] || {}

const { name: NAME, version: LATEST_VERSION } = require('../package.json')
const MERGE_KEYS = [...FILE_KEYS, 'defaultContent', 'content']
const DEFAULT_CONTENT = require.resolve(NAME)

const merge = withArrays('branches', 'distPaths', 'allowPaths', 'ignorePaths')

const makePosix = (v) => v.split(win32.sep).join(posix.sep)
const deglob = (v) => makePosix(v).replace(/[/*]+$/, '')
const posixDir = (v) => `${v === '.' ? '' : deglob(v).replace(/\/$/, '')}${posix.sep}`
const posixGlob = (str) => `${posixDir(str)}**`

const getCmdPath = (key, { rootConfig, defaultConfig, isRoot, path, root }) => {
  // Make a path relative from a workspace to the root if we are in a workspace
  const wsToRoot = (p) => isRoot ? p : makePosix(join(relative(path, root), p))

  const rootPath = rootConfig[key]
  const defaultPath = defaultConfig[key]
  const isLocal = rootPath && rootPath !== defaultPath

  return {
    isLocal,
    root: !isLocal ? defaultPath : `node ${rootPath}`,
    local: !isLocal ? defaultPath : `node ${wsToRoot(rootPath)}`,
  }
}

const mergeConfigs = (...configs) => {
  const mergedConfig = merge(...configs.map(c => pick(c, MERGE_KEYS)))
  return defaults(mergedConfig, {
    defaultContent: DEFAULT_CONTENT,
    // allow all file types by default
    ...FILE_KEYS.reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}),
  })
}

const readContentPath = (path) => {
  if (!path) {
    return {}
  }

  let content = {}
  const index = extname(path) === '.js' ? path : join(path, 'index.js')
  const dir = dirname(index)

  try {
    content = require(index)
  } catch {
    // its ok if this fails since the content dir
    // might only be to provide other files. the
    // index.js is optional
  }

  return { content, dir }
}

const getConfig = (path, rawConfig) => {
  const config = omit(readContentPath(path).content, FILE_KEYS)
  return merge(config, rawConfig ? omit(rawConfig, FILE_KEYS) : {})
}

const getFiles = (path, rawConfig) => {
  const { content, dir } = readContentPath(path)
  if (!dir) {
    return []
  }
  return [parseFiles(pick(content, FILE_KEYS), dir, pick(rawConfig, FILE_KEYS)), dir]
}

const getFullConfig = async ({
  // the path to the root of the repo
  root,
  // the path to the package being operated on
  // this is the same as root when operating on the root
  path,
  // the full contents of the package.json for this package
  pkgJson,
  // an array of all package info {pkgJson,path,config}[]
  pkgs,
  // an array of all workspaces in this repo
  workspaces,
  // the config from the package.json in the root
  rootConfig: _rootConfig,
  // the config from the package.json being operated on
  pkgConfig: _pkgConfig,
}) => {
  const isRoot = root === path
  const isLatest = _pkgConfig.version === LATEST_VERSION
  const isDogFood = pkgJson.name === NAME
  const isForce = process.argv.includes('--force')

  // These config items are merged betweent the root and child workspaces and only come from
  // the package.json because they can be used to read configs from other the content directories
  const mergedConfig = mergeConfigs(_rootConfig, _pkgConfig)

  const defaultConfig = getConfig(DEFAULT_CONTENT)
  const [defaultFiles, defaultDir] = getFiles(DEFAULT_CONTENT, mergedConfig)
  const useDefault = mergedConfig.defaultContent && defaultConfig

  const rootConfig = getConfig(_rootConfig.content, _rootConfig)
  const [rootFiles, rootDir] = getFiles(_rootConfig.content, mergedConfig)

  // The content config only gets set from the package we are in, it doesn't inherit
  // anything from the root
  const rootPkgConfig = merge(useDefault, rootConfig)
  const pkgConfig = merge(useDefault, getConfig(_pkgConfig.content, _pkgConfig))
  const [pkgFiles, pkgDir] = getFiles(mergedConfig.content, mergedConfig)

  // Files get merged in from the default content (that template-oss provides) as well
  // as any content paths provided from the root or the workspace
  const fileDirs = uniq([useDefault && defaultDir, rootDir, pkgDir].filter(Boolean))
  const files = merge(useDefault && defaultFiles, rootFiles, pkgFiles)
  const repoFiles = isRoot ? files.rootRepo : files.workspaceRepo
  const moduleFiles = isRoot ? files.rootModule : files.workspaceModule

  const allowRootDirs = [
    // Allways allow module files in root or workspaces
    ...getAddedFiles(moduleFiles),
    ...isRoot ? [
      // in the root allow all repo files
      ...getAddedFiles(repoFiles),
      // and allow all workspace repo level files in the root
      ...pkgs
        .filter(p => p.path !== root && p.config.workspaceRepo !== false)
        .flatMap(() => getAddedFiles(files.workspaceRepo)),
    ] : [],
  ]

  // root only configs
  const npmPath = getCmdPath('npm', { rootConfig, defaultConfig, isRoot, path, root })
  const npxPath = getCmdPath('npx', { rootConfig, defaultConfig, isRoot, path, root })

  // these are written to ci yml files so it needs to always use posix
  const pkgPath = makePosix(relative(root, path)) || '.'

  // we use the raw paths from the package.json workspaces as ignore patterns in
  // some cases. the workspaces passed in have already been run through map workspaces
  const workspacePaths = (pkgJson.workspaces || []).map(deglob)

  // all derived keys
  const derived = {
    isRoot,
    isWorkspace: !isRoot,
    // Some files are written to the base of a repo but will
    // include configuration for all packages within a monorepo
    // For these cases it is helpful to know if we are in a
    // monorepo since template-oss might be used only for
    // workspaces and not the root or vice versa.
    isRootMono: isRoot && !!workspaces.length,
    isMono: !!workspaces.length,
    // repo
    repoDir: root,
    repoFiles,
    applyRepo: !!repoFiles,
    // module
    moduleDir: path,
    moduleFiles,
    applyModule: !!moduleFiles,
    // package
    pkgName: pkgJson.name,
    pkgNameFs: pkgJson.name.replace(/\//g, '-').replace(/@/g, ''),
    // paths
    pkgPath,
    pkgDir: posixDir(pkgPath),
    pkgGlob: posixGlob(pkgPath),
    pkgFlags: isRoot ? '-iwr' : `-w ${pkgJson.name}`,
    allFlags: `${workspaces.length ? '-ws -iwr' : ''} --if-present`.trim(),
    workspacePaths,
    workspaceGlobs: workspacePaths.map(posixGlob),
    // booleans to control application of updates
    isForce,
    isDogFood,
    isLatest,
    // whether to install and update npm in ci
    // only do this if we aren't using a custom path to bin
    updateNpm: !npmPath.isLocal,
    rootNpmPath: npmPath.root,
    localNpmPath: npmPath.local,
    rootNpxPath: npxPath.root,
    // lockfiles are only present at the root, so this only should be set for
    // all workspaces based on the root
    lockfile: rootPkgConfig.lockfile,
    // gitignore
    ignorePaths: [
      ...gitignore.sort([
        ...gitignore.allowRootDir(allowRootDirs),
        ...isRoot && pkgConfig.lockfile ? ['!/package-lock.json'] : [],
        ...(pkgConfig.allowPaths || []).map((p) => `!${p}`),
        ...(pkgConfig.ignorePaths || []),
      ]),
      // these cant be sorted since they rely on order
      // to allow a previously ignored directoy
      ...isRoot ? gitignore.allowDir(workspaces.map((p) => makePosix(relative(root, p)))) : [],
    ],
    // needs update if we are dogfooding this repo, with force argv, or its
    // behind the current version
    needsUpdate: isForce || isDogFood || !isLatest,
    // templateoss specific values
    __NAME__: NAME,
    __CONFIG_KEY__: CONFIG_KEY,
    __VERSION__: LATEST_VERSION,
    __PARTIAL_DIRS__: fileDirs,
  }

  if (pkgConfig.ciVersions) {
    let versions = pkgConfig.ciVersions
    if (versions === 'latest') {
      const defaultVersions = [rootPkgConfig, defaultConfig].find(c => Array.isArray(c.ciVersions))
      versions = defaultVersions.ciVersions.slice(-1)
    }

    const { targets, engines } = parseCIVersions(versions)

    // get just a list of the target versions (not ranges)
    // these are used for the node version when doing engines checks
    // since we want to test in the lowest version of each major
    let targetVersions = targets.filter(t => semver.valid(t))
    // if the versions are all ranges then convert them to the lower bound of each range
    if (!targetVersions.length) {
      targetVersions = targets.filter(t => semver.validRange(t)).map(t => {
        return new semver.Range(t).set[0][0].semver.version
      })
    }

    derived.ciVersions = targets
    derived.baseCiVersions = targetVersions
    derived.engines = pkgConfig.engines || engines
  }

  const gitUrl = await getGitUrl(root)
  if (gitUrl) {
    derived.repository = {
      type: 'git',
      url: gitUrl,
      ...(!isRoot ? { directory: pkgPath } : {}),
    }
  }

  return {
    ...pkgConfig,
    ...derived,
  }
}

module.exports = getFullConfig
module.exports.getPkgConfig = getPkgConfig
