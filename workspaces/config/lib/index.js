const { relative, dirname, join, extname, posix, win32 } = require('path')
const { defaults, pick, omit, uniq, defaultsDeep, mergeWith } = require('lodash')
const deepMapValues = require('just-deep-map-values')
const semver = require('semver')
const parseCIVersions = require('./parse-ci-versions.js')
const getGitUrl = require('./get-git-url.js')
const gitignore = require('./gitignore.js')

const FILE_KEYS = ['rootRepo', 'rootModule', 'workspaceRepo', 'workspaceModule']
const MERGE_KEYS = [...FILE_KEYS, 'defaultContent', 'content']
const MERGE_CONFIG_ARRAY_KEYS = ['branches', 'distPaths', 'allowPaths', 'ignorePaths']

const merge = (...o) => mergeWith({}, ...o, (_, srcValue) => {
  if (Array.isArray(srcValue)) {
    // Dont merge arrays, last array wins
    return srcValue
  }
})

const mergeConfig = (...o) => mergeWith({}, ...o, (value, srcValue, key) => {
  if (Array.isArray(srcValue)) {
    if (MERGE_CONFIG_ARRAY_KEYS.includes(key)) {
      return (Array.isArray(value) ? value : []).concat(srcValue)
    }
    return srcValue
  }
})

const makePosix = (v) => v.split(win32.sep).join(posix.sep)
const deglob = (v) => {
  let posixGlob = makePosix(v)
  while (posixGlob.endsWith('/') || posixGlob.endsWith('*')) {
    posixGlob = posixGlob.slice(0, -1)
  }
  return posixGlob
}
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

const parseConfigFiles = (files, dir, overrides, configKeys) => {
  const normalizeFiles = (v) => deepMapValues(v, (value, key) => {
    if (key === 'rm' && Array.isArray(value)) {
      return value.reduce((acc, k) => {
        acc[k] = true
        return acc
      }, {})
    }
    if (typeof value === 'string') {
      const file = join(dir, value)
      return key === 'file' ? file : { file }
    }
    if (value === true && configKeys.includes(key)) {
      return {}
    }
    return value
  })

  const merged = merge(normalizeFiles(files), normalizeFiles(overrides))
  const withDefaults = defaultsDeep(merged, configKeys.reduce((acc, k) => {
    acc[k] = { add: {}, rm: {} }
    return acc
  }, {}))

  return withDefaults
}

const mergeConfigs = (defaultContent, ...configs) => {
  const mergedConfig = mergeConfig(...configs.map(c => pick(c, MERGE_KEYS)))
  return defaults(mergedConfig, {
    defaultContent,
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
  return mergeConfig(config, rawConfig ? omit(rawConfig, FILE_KEYS) : {})
}

const getFiles = (path, rawConfig) => {
  const { content, dir } = readContentPath(path)
  if (!dir) {
    return []
  }
  return [
    parseConfigFiles(pick(content, FILE_KEYS), dir, pick(rawConfig, FILE_KEYS), FILE_KEYS),
    dir,
  ]
}

const getAddedFiles = (files) => files ? Object.keys(files.add || {}) : []

const getFullConfig = async ({
  // everything is an object or an array of objects with the following
  // path: the path to the package root
  // pkgJson: the package json path
  // config: the template oss config from the package root
  pkg, // the package currently being operated on
  rootPkg, // the root pkg (same as pkg when operating on the root)
  pkgs, // an array of all packages to be operated on
  wsPkgs, // an array of all workspaces being operated
  defaultContent, // path to default content dir
}) => {
  const isRoot = rootPkg.path === pkg.path
  const isWorkspace = !isRoot
  const isMono = !!wsPkgs.length
  const isRootMono = isRoot && isMono

  // These config items are merged betweent the root and child workspaces and only come from
  // the package.json because they can be used to read configs from other the content directories
  const mergedConfig = mergeConfigs(defaultContent, rootPkg.config, pkg.config)

  const defaultConfig = getConfig(defaultContent)
  const [defaultFiles, defaultDir] = getFiles(defaultContent, mergedConfig)
  const useDefault = mergedConfig.defaultContent && defaultConfig

  const rootConfig = getConfig(rootPkg.config.content, rootPkg.config)
  const [rootFiles, rootDir] = getFiles(rootPkg.config.content, mergedConfig)

  // The content config only gets set from the package we are in, it doesn't inherit
  // anything from the root
  const rootPkgConfig = mergeConfig(useDefault, rootConfig)
  const pkgConfig = mergeConfig(useDefault, getConfig(pkg.config.content, pkg.config))
  const [pkgFiles, pkgDir] = getFiles(mergedConfig.content, mergedConfig)

  // Files get merged in from the default content (that template-oss provides) as well
  // as any content paths provided from the root or the workspace
  const fileDirs = uniq([useDefault && defaultDir, rootDir, pkgDir].filter(Boolean))
  const files = mergeConfig(useDefault && defaultFiles, rootFiles, pkgFiles)
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
    workspacePaths,
    workspaceGlobs: workspacePaths.map(posixGlob),
    // whether to install and update npm in ci
    // only do this if we aren't using a custom path to bin
    updateNpm: !npmPath.isLocal,
    rootNpmPath: npmPath.root,
    localNpmPath: npmPath.local,
    rootNpxPath: npxPath.root,
    // lockfiles are only present at the root, so this only should be set for
    // all workspaces based on the root
    lockfile: !!rootPkgConfig.lockfile,
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
    // templateoss specific values
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

  const gitUrl = await getGitUrl(rootPkg.path)
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
