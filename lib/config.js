const { relative, dirname, join, extname, posix, win32 } = require('path')
const { defaults, pick, omit, uniq, isPlainObject } = require('lodash')
const ciVersions = require('./util/ci-versions.js')
const parseDependabot = require('./util/dependabot.js')
const git = require('./util/git.js')
const gitignore = require('./util/gitignore.js')
const { mergeWithCustomizers, customizers } = require('./util/merge.js')
const { FILE_KEYS, parseConfig: parseFiles, getAddedFiles, mergeFiles } = require('./util/files.js')

const CONFIG_KEY = 'templateOSS'
const getPkgConfig = (pkg) => pkg[CONFIG_KEY] || {}

const { name: NAME, version: LATEST_VERSION } = require('../package.json')
const { minimatch } = require('minimatch')
const MERGE_KEYS = [...FILE_KEYS, 'defaultContent', 'content']
const DEFAULT_CONTENT = require.resolve(NAME)

const merge = mergeWithCustomizers(
  customizers.mergeArrays('branches', 'distPaths', 'allowPaths', 'ignorePaths'),
  (value, srcValue, key) => {
    if (key === 'ciVersions' && (Array.isArray(srcValue) || isPlainObject(srcValue))) {
      return { ...ciVersions.parse(value), ...ciVersions.parse(srcValue) }
    }
  }
)

const makePosix = (v) => v.split(win32.sep).join(posix.sep)
const deglob = (v) => makePosix(v).replace(/[/*]+$/, '')
const posixDir = (v) => `${v === '.' ? '' : deglob(v).replace(/\/$/, '')}${posix.sep}`
const posixGlob = (str) => `${posixDir(str)}**`

const getCmdPath = (key, { rootConfig, defaultConfig, isRoot, pkg, rootPkg }) => {
  // Make a path relative from a workspace to the root if we are in a workspace
  const wsToRoot = (p) => isRoot ? p : makePosix(join(relative(pkg.path, rootPkg.path), p))

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
  // everything is an object or an array of objects with the following
  // path: the path to the package root
  // pkgJson: the package json path
  // config: the template oss config from the package root
  pkg, // the package currently being operated on
  rootPkg, // the root pkg (same as pkg when operating on the root)
  pkgs, // an array of all packages to be operated on
  wsPkgs, // an array of all workspaces being operated
}) => {
  const isRoot = rootPkg.path === pkg.path
  const isWorkspace = !isRoot
  const isMono = !!wsPkgs.length
  const isRootMono = isRoot && isMono

  const isLatest = pkg.config.version === LATEST_VERSION
  const isDogFood = rootPkg.pkgJson.name === NAME
  const isForce = process.argv.includes('--force')

  // These config items are merged betweent the root and child workspaces and only come from
  // the package.json because they can be used to read configs from other the content directories
  const mergedConfig = mergeConfigs(rootPkg.config, pkg.config)

  const defaultConfig = getConfig(DEFAULT_CONTENT)
  const [defaultFiles, defaultDir] = getFiles(DEFAULT_CONTENT, mergedConfig)
  const useDefault = mergedConfig.defaultContent && defaultConfig

  const rootConfig = getConfig(rootPkg.config.content, rootPkg.config)
  const [rootFiles, rootDir] = getFiles(rootPkg.config.content, mergedConfig)

  // The content config only gets set from the package we are in, it doesn't inherit
  // anything from the root
  const rootPkgConfig = merge(useDefault, rootConfig)
  const pkgConfig = merge(useDefault, getConfig(pkg.config.content, pkg.config))
  const [pkgFiles, pkgDir] = getFiles(mergedConfig.content, mergedConfig)

  // Files get merged in from the default content (that template-oss provides) as well
  // as any content paths provided from the root or the workspace
  const fileDirs = uniq([useDefault && defaultDir, rootDir, pkgDir].filter(Boolean))
  const files = mergeFiles(useDefault && defaultFiles, rootFiles, pkgFiles)
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
        .filter(p => p.path !== rootPkg.path && p.config.workspaceRepo !== false)
        .flatMap(() => getAddedFiles(files.workspaceRepo)),
    ] : [],
  ]

  // root only configs
  const npmPath = getCmdPath('npm', { rootConfig, defaultConfig, isRoot, pkg, rootPkg })
  const npxPath = getCmdPath('npx', { rootConfig, defaultConfig, isRoot, pkg, rootPkg })

  // these are written to ci yml files so it needs to always use posix
  const pkgPath = makePosix(relative(rootPkg.path, pkg.path)) || '.'

  // we use the raw paths from the package.json workspaces as ignore patterns in
  // some cases. the workspaces passed in have already been run through map workspaces
  const workspacePaths = (pkg.pkgJson.workspaces || []).map(deglob)

  const isPrivate = !!pkg.pkgJson.private
  const isPublic = !isPrivate
  const publicPkgs = pkgs.filter(p => !p.pkgJson.private)
  const allPrivate = pkgs.every(p => p.pkgJson.private)

  const branches = uniq([...pkgConfig.branches ?? [], pkgConfig.releaseBranch]).filter(Boolean)
  const gitBranches = await git.getBranches(rootPkg.path, branches)
  const currentBranch = await git.currentBranch(rootPkg.path)
  const isReleaseBranch = currentBranch ? minimatch(currentBranch, pkgConfig.releaseBranch) : false
  const defaultBranch = await git.defaultBranch(rootPkg.path) ?? 'main'

  // all derived keys
  const derived = {
    isRoot,
    isWorkspace,
    isMono,
    // Some files are written to the base of a repo but will
    // include configuration for all packages within a monorepo
    // For these cases it is helpful to know if we are in a
    // monorepo since template-oss might be used only for
    // workspaces and not the root or vice versa.
    isRootMono,
    // public/private
    isPublic,
    isPrivate,
    allPrivate,
    // controls whether we are in a monorepo with any public workspaces
    isMonoPublic: isMono && !!publicPkgs.filter(p => p.path !== rootPkg.path).length,
    // git
    defaultBranch,
    baseBranch: isReleaseBranch ? currentBranch : defaultBranch,
    branches: gitBranches.branches,
    branchPatterns: gitBranches.patterns,
    isReleaseBranch,
    // dependabot
    dependabot: parseDependabot(pkgConfig, defaultConfig, gitBranches.branches),
    // repo
    repoDir: rootPkg.path,
    repoFiles,
    applyRepo: !!repoFiles,
    // module
    moduleDir: pkg.path,
    moduleFiles,
    applyModule: !!moduleFiles,
    // package
    pkgName: pkg.pkgJson.name,
    pkgNameFs: pkg.pkgJson.name.replace(/\//g, '-').replace(/@/g, ''),
    // paths
    pkgPath,
    pkgDir: posixDir(pkgPath),
    pkgGlob: posixGlob(pkgPath),
    pkgFlags: isWorkspace ? `-w ${pkg.pkgJson.name}` : '',
    allFlags: isMono ? '-ws -iwr --if-present' : '',
    workspacePaths,
    workspaceGlobs: workspacePaths.map(posixGlob),
    // booleans to control application of updates
    isForce,
    isDogFood,
    isLatest,
    // whether to install and update npm in ci
    // only do this if we aren't using a custom path to bin
    updateNpm: !npmPath.isLocal && pkgConfig.updateNpm,
    rootNpmPath: npmPath.root,
    localNpmPath: npmPath.local,
    rootNpxPath: npxPath.root,
    // lockfiles are only present at the root, so this only should be set for
    // all workspaces based on the root
    lockfile: rootPkgConfig.lockfile,
    // ci versions / engines
    ciVersions: ciVersions.get(pkg.pkgJson.engines?.node, pkgConfig),
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
      ...isRoot
        ? gitignore.allowDir(wsPkgs.map((p) => makePosix(relative(rootPkg.path, p.path))))
        : [],
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

  if (!pkgConfig.eslint) {
    derived.ignorePaths = derived.ignorePaths.filter(p => !p.includes('eslint'))
    if (Array.isArray(pkgConfig.requiredPackages?.devDependencies)) {
      pkgConfig.requiredPackages.devDependencies =
        pkgConfig.requiredPackages.devDependencies.filter(p => !p.includes('eslint'))
    }
  }

  const gitUrl = await git.getUrl(rootPkg.path)
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
