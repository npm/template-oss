const { relative, dirname, join, extname, posix, win32 } = require('path')
const { defaults, pick, omit, uniq } = require('lodash')
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

const makePosix = (str) => str.split(win32.sep).join(posix.sep)

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
  root,
  path,
  pkg,
  pkgs,
  workspaces,
  rootConfig: _rootConfig,
  pkgConfig: _pkgConfig,
}) => {
  const isRoot = root === path
  const isRootMono = isRoot && workspaces.length > 0
  const isLatest = _pkgConfig.version === LATEST_VERSION
  const isDogFood = pkg.name === NAME
  const isForce = process.argv.includes('--force')

  // this is written to ci yml files so it needs to always use posix
  const pkgRelPath = makePosix(relative(root, path))

  const workspacePkgs = pkgs.filter((p) => p.path !== path)
  const workspaceDirs = isRootMono && workspaces.map((p) => makePosix(relative(root, p)))
  const workspaceGlobs = isRootMono && pkg.workspaces.map(p => p.replace(/[/*]+$/, ''))

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
      // and allow all workspace repo level files
      ...workspacePkgs.filter(p => p.config.workspaceRepo !== false).flatMap((p) =>
        getAddedFiles(files.workspaceRepo)
      ),
    ] : [],
  ]

  const npmPath = getCmdPath('npm', { rootConfig, defaultConfig, isRoot, path, root })
  const npxPath = getCmdPath('npx', { rootConfig, defaultConfig, isRoot, path, root })

  // all derived keys
  const derived = {
    isRoot,
    isWorkspace: !isRoot,
    // Some files are written to the base of a repo but will
    // include configuration for all packages within a monorepo
    // For these cases it is helpful to know if we are in a
    // monorepo since template-oss might be used only for
    // workspaces and not the root or vice versa.
    isRootMono,
    isMono: isRootMono || !isRoot,
    // repo
    repoDir: root,
    repoFiles,
    applyRepo: !!repoFiles,
    // module
    moduleDir: path,
    moduleFiles,
    applyModule: !!moduleFiles,
    // package
    pkgName: pkg.name,
    pkgNameFs: pkg.name.replace(/\//g, '-').replace(/@/g, ''),
    pkgRelPath: pkgRelPath,
    pkgPrivate: !!pkg.private,
    pkgPublic: !pkg.private,
    workspaces: workspaceDirs,
    workspaceGlobs,
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
      ...gitignore.allowDir(workspaceDirs || []),
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
    const versions = pkgConfig.ciVersions
    const defaultVersions = defaultConfig.ciVersions
    const parsed = parseCIVersions(versions === 'latest' ? defaultVersions.slice(-1) : versions)
    derived.ciVersions = parsed.targets
    derived.engines = pkgConfig.engines || parsed.engines
  }

  const gitUrl = await getGitUrl(root)
  if (gitUrl) {
    derived.repository = {
      type: 'git',
      url: gitUrl,
      ...(pkgRelPath ? { directory: pkgRelPath } : {}),
    }
  }

  return {
    ...pkgConfig,
    ...derived,
  }
}

module.exports = getFullConfig
module.exports.getPkgConfig = getPkgConfig
