const { relative, dirname, join, extname } = require('path')
const { defaults, defaultsDeep, pick, omit, uniq, isPlainObject } = require('lodash')
const semver = require('semver')
const ciVersions = require('./util/ci-versions.js')
const parseDependabot = require('./util/dependabot.js')
const git = require('./util/git.js')
const gitignore = require('./util/gitignore.js')
const { mergeWithCustomizers, customizers } = require('./util/merge.js')
const { FILE_KEYS, parseConfig: parseFiles, getAddedFiles, mergeFiles } = require('./util/files.js')
const template = require('./util/template.js')
const getCmdPath = require('./util/get-cmd-path.js')
const importOrRequire = require('./util/import-or-require.js')
const { makePosix, deglob, posixDir, posixGlob } = require('./util/path.js')
const { name: NAME, version: LATEST_VERSION } = require('../package.json')

const CONFIG_KEY = 'templateOSS'
const MERGE_KEYS = [...FILE_KEYS, 'defaultContent', 'content']
const DEFAULT_CONTENT = require.resolve(NAME)
const getPkgConfig = (pkg) => pkg[CONFIG_KEY] || {}

const merge = mergeWithCustomizers(
  customizers.mergeArrays(
    'branches',
    'distPaths',
    'allowPaths',
    'ignorePaths',
    'lintIgnorePaths',
    'lintExtensions',
    'formatIgnorePaths',
    'formatExtensions'
  ),
  (value, srcValue, key) => {
    if (key === 'ciVersions' && (Array.isArray(srcValue) || isPlainObject(srcValue))) {
      return { ...ciVersions.parse(value), ...ciVersions.parse(srcValue) }
    }
  }
)

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

const readContentPath = async (path) => {
  if (!path) {
    return {}
  }

  const index = extname(path) === '.js' ? path : join(path, 'index.js')
  const dir = dirname(index)
  const content = await importOrRequire(index)

  return { content, dir }
}

const getConfig = async (path, rawConfig) => {
  const { content } = await readContentPath(path)
  const config = omit(content, FILE_KEYS)
  return merge(config, rawConfig ? omit(rawConfig, FILE_KEYS) : {})
}

const getFiles = async (path, rawConfig, templateSettings) => {
  const { content, dir } = await readContentPath(path)
  if (!dir) {
    return []
  }
  return [
    parseFiles(pick(content, FILE_KEYS), dir, pick(rawConfig, FILE_KEYS), templateSettings),
    dir,
  ]
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
  const defaultConfig = await getConfig(DEFAULT_CONTENT)
  const useDefault = mergedConfig.defaultContent && defaultConfig

  const rootConfig = await getConfig(rootPkg.config.content, rootPkg.config)

  // The content config only gets set from the package we are in, it doesn't inherit
  // anything from the root
  const rootPkgConfig = merge(useDefault, rootConfig)
  const pkgConfig = merge(useDefault, await getConfig(pkg.config.content, pkg.config))

  const npmPath = getCmdPath('npm', { pkgConfig, rootConfig, isRoot, pkg, rootPkg })
  const npxPath = getCmdPath('npx', { pkgConfig, rootConfig, isRoot, pkg, rootPkg })

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
  const defaultBranch = await git.defaultBranch(rootPkg.path) ?? 'main'
  const isReleaseBranch = !!pkgConfig.backport
  const releaseBranch = isReleaseBranch
    ? pkgConfig.releaseBranch.replace(/\*/g, pkgConfig.backport)
    : defaultBranch

  const esm = pkg.pkgJson?.type === 'module' || !!pkgConfig.typescript || !!pkgConfig.esm

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
    branches: gitBranches.branches,
    branchPatterns: gitBranches.patterns,
    isReleaseBranch,
    releaseBranch,
    dependabot: parseDependabot(pkgConfig, defaultConfig, gitBranches.branches),
    // paths
    repoDir: rootPkg.path,
    moduleDir: pkg.path,
    pkgName: pkg.pkgJson.name,
    pkgNameFs: pkg.pkgJson.name.replace(/\//g, '-').replace(/@/g, ''),
    pkgPath,
    pkgDir: posixDir(pkgPath),
    pkgGlob: posixGlob(pkgPath),
    pkgFlags: isWorkspace ? `-w ${pkg.pkgJson.name}` : '',
    allFlags: isMono ? '-ws -iwr --if-present' : '',
    workspacePaths,
    workspaceGlobs: workspacePaths.map(posixGlob),
    // type
    esm,
    cjsExt: esm ? 'cjs' : 'js',
    deleteJsExt: esm ? 'js' : 'cjs',
    // tap
    tap18: semver.coerce(pkg.pkgJson?.devDependencies?.tap)?.major === 18,
    tap16: semver.coerce(pkg.pkgJson?.devDependencies?.tap)?.major === 16,
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
    // needs update if we are dogfooding this repo, with force argv, or its
    // behind the current version
    needsUpdate: isForce || isDogFood || !isLatest,
    // templateoss specific values
    __NAME__: NAME,
    __CONFIG_KEY__: CONFIG_KEY,
    __VERSION__: LATEST_VERSION,
  }

  if (!pkgConfig.eslint && Array.isArray(pkgConfig.requiredPackages?.devDependencies)) {
    pkgConfig.requiredPackages.devDependencies =
      pkgConfig.requiredPackages.devDependencies.filter(p => !p.includes('eslint'))
  }

  pkgConfig.lintIgnorePaths = [
    ...(pkgConfig.ignorePaths || []),
    ...(pkgConfig.lintIgnorePaths || []),
    ...derived.workspaceGlobs,
  ]

  pkgConfig.formatIgnorePaths = [
    ...(pkgConfig.ignorePaths || []),
    ...(pkgConfig.formatIgnorePaths || []),
    ...derived.workspaceGlobs,
  ]

  if (pkgConfig.typescript) {
    defaultsDeep(pkgConfig, { allowPaths: [], requiredPackages: { devDependencies: [] } })
    pkgConfig.distPaths = ['dist/']
    pkgConfig.lintIgnorePaths = uniq([...pkgConfig.lintIgnorePaths, 'dist/'])
    pkgConfig.formatIgnorePaths = uniq([...pkgConfig.formatIgnorePaths, 'dist/'])
    pkgConfig.allowDistPaths = false
    pkgConfig.allowPaths = uniq([...pkgConfig.allowPaths, '/src/'])
    pkgConfig.requiredPackages.devDependencies = uniq([
      ...pkgConfig.requiredPackages.devDependencies,
      'typescript',
      'tshy',
      '@typescript-eslint/parser',
      ...derived.tap16 ? ['c8', 'ts-node'] : [],
    ])
  }

  if (pkgConfig.prettier) {
    defaultsDeep(pkgConfig, { requiredPackages: { devDependencies: [] } })
    pkgConfig.requiredPackages.devDependencies = uniq([
      ...pkgConfig.requiredPackages.devDependencies,
      'prettier',
      'eslint-config-prettier',
      '@github/prettier-config',
    ])
  }

  const gitUrl = await git.getUrl(rootPkg.path)
  if (gitUrl) {
    derived.repository = {
      type: 'git',
      url: gitUrl,
      ...(!isRoot ? { directory: pkgPath } : {}),
    }
  }

  const fullConfig = { ...pkgConfig, ...derived }

  // files, come at the end since file names can be based on config
  const [defaultFiles, defaultDir] = await getFiles(DEFAULT_CONTENT, mergedConfig, fullConfig)
  const [rootFiles, rootDir] = await getFiles(rootPkg.config.content, mergedConfig, fullConfig)
  const [pkgFiles, pkgDir] = await getFiles(mergedConfig.content, mergedConfig, fullConfig)

  // Files get merged in from the default content (that template-oss provides) as well
  // as any content paths provided from the root or the workspace
  const fileDirs = uniq([useDefault && defaultDir, rootDir, pkgDir].filter(Boolean))
  const files = mergeFiles(useDefault && defaultFiles, rootFiles, pkgFiles)
  const repoFiles = isRoot ? files.rootRepo : files.workspaceRepo
  const moduleFiles = isRoot ? files.rootModule : files.workspaceModule

  Object.assign(fullConfig, {
    repoFiles,
    moduleFiles,
    applyRepo: !!repoFiles,
    applyModule: !!moduleFiles,
    __PARTIAL_DIRS__: fileDirs,
  })

  const ignoreAddedPaths = gitignore.sort([
    ...gitignore.allowRootDir([
      // Allways allow module files in root or workspaces
      ...getAddedFiles(moduleFiles).map(s => template(s, fullConfig)),
      ...(isRoot
        ? [
          // in the root allow all repo files
          ...getAddedFiles(repoFiles).map(s => template(s, fullConfig)),
          // and allow all workspace repo level files in the root
          ...pkgs
            .filter(p => p.path !== rootPkg.path && p.config.workspaceRepo !== false)
            .flatMap(() => getAddedFiles(files.workspaceRepo)),
        ]
        : []),
    ]),
    ...(isRoot && pkgConfig.lockfile ? ['!/package-lock.json'] : []),
  ])

  Object.assign(fullConfig, {
    // Make sure we don't format any files that are being generated since they will cause template-oss-check to fail
    // This could be changed if those files were also formatted before save but then we would need to read generated
    // the prettier config first and use that as the formatting rules which would get weird
    formatIgnorePaths: [
      ...fullConfig.formatIgnorePaths,
      ...ignoreAddedPaths
        .filter(f => f.startsWith('!'))
        .map(f => f.replace(/^!/, ''))
        .filter(f => {
          const ext = extname(f).slice(1)
          // ignore it if the specified format extensions match or if its a directory
          return (fullConfig.formatExtensions || []).includes(ext) || (!ext && f.endsWith('/'))
        }),
    ],
    // gitignore, these use the full config so need to come at the very end
    ignorePaths: [
      ...gitignore.sort([
        ...ignoreAddedPaths,
        ...(pkgConfig.allowPaths || []).map(p => `!${p}`),
        ...(pkgConfig.allowDistPaths ? pkgConfig.distPaths : []).map(p => `!/${p}`),
        ...(pkgConfig.ignorePaths || []),
      ]),
      // these cant be sorted since they rely on order
      // to allow a previously ignored directoy
      ...isRoot
        ? gitignore.allowDir(wsPkgs.map((p) => makePosix(relative(rootPkg.path, p.path))))
        : [],
    ].filter(p => !pkgConfig.eslint ? !p.includes('eslint') : true),
  })

  return fullConfig
}

module.exports = getFullConfig
module.exports.getPkgConfig = getPkgConfig
