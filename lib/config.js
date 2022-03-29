const { relative, dirname, posix, win32 } = require('path')
const log = require('proc-log')
const { uniq, defaults } = require('lodash')
const parseCIVersions = require('./util/parse-ci-versions.js')
const getGitUrl = require('./util/get-git-url.js')
const { name: NAME, version: LATEST_VERSION } = require('../package.json')

const CONFIG_KEY = 'templateOSS'
const getPkgConfig = (pkg) => pkg[CONFIG_KEY] || {}

const getContent = (contentPath) => {
  if (typeof contentPath === 'string') {
    return defaults(require(contentPath), {
      sourceDir: dirname(require.resolve(contentPath)),
    })
  } else {
    // allow passing in content directly for tests
    return contentPath
  }
}

// falsy means no content of this type
const getFiles = (config, content) => config ? content : null
const getFileKeys = (files) => files ? Object.keys(files.add || {}) : []
const negatePath = (p) => {
  // XXX: this negates the first part of each path for the gitignore
  // files. it might make sense to negate more specific portions of the
  // path for some paths like workspaces. so instead of ignoring !/workspaces
  // it would only ignore !/workspaces/a, !/workspaces/b, etc
  const [first, ...parts] = p.split(posix.sep)
  const isDir = parts.length > 0
  return `!${posix.sep}${first}${isDir ? posix.sep : ''}`
}

const makePosix = (str) => str.split(win32.sep).join(posix.sep)

const getConfig = async ({
  pkgs,
  workspaces,
  root,
  path,
  pkg,
  // default content path is looked up via require.resolve
  // so use the name of this module since package.json#main
  // points to the content dir
  content: contentPath = NAME,
  config: {
    rootRepo,
    rootModule,
    workspaceRepo,
    workspaceModule,
    version,
    ...pkgContent
  },
}) => {
  const isRoot = root === path
  const isLatest = version === LATEST_VERSION
  const isDogFood = pkg.name === NAME
  const isForce = process.argv.includes('--force')

  // this is written to ci yml files so it needs to always use posix
  const pkgRelPath = makePosix(relative(root, path))
  const gitUrl = await getGitUrl(root)

  const {
    rootRepo: rootRepoContent,
    rootModule: rootModuleContent,
    workspaceRepo: workspaceRepoContent,
    workspaceModule: workspaceModuleContent,
    ...baseContent
  } = getContent(contentPath)

  let repoFiles, moduleFiles
  const ignorePaths = []

  if (isRoot) {
    repoFiles = getFiles(rootRepo, rootRepoContent)
    moduleFiles = getFiles(rootModule, rootModuleContent)
    ignorePaths.push(
      // allow workspace paths if they are set, this is directly from
      // map-workspaces so normalize to posix paths for gitignore
      ...workspaces.map((p) => makePosix(relative(root, p))),
      // allow both the repo and module files since this is the root
      ...getFileKeys(repoFiles),
      ...getFileKeys(moduleFiles),
      // allow all workspace repo level files
      ...pkgs.filter((p) => p.path !== path).flatMap((p) =>
        getFileKeys(getFiles(p.config.workspaceRepo, workspaceRepoContent))
      )
    )
  } else {
    repoFiles = getFiles(workspaceRepo, workspaceRepoContent)
    moduleFiles = getFiles(workspaceModule, workspaceModuleContent)
    // In a workspace gitignores are relative to the workspace dir
    // so we should only allow added module files
    ignorePaths.push(...getFileKeys(moduleFiles))
  }

  // all derived keys
  const derived = {
    isRoot,
    isWorkspace: !isRoot,
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
    // booleans to control application of updates
    isForce,
    isDogFood,
    isLatest,
    // needs update if we are dogfooding this repo, with force argv, or its
    // behind the current version
    needsUpdate: isForce || isDogFood || !isLatest,
    // templateoss specific values
    __NAME__: NAME,
    __CONFIG_KEY__: CONFIG_KEY,
    __VERSION__: LATEST_VERSION,
  }

  // merge the rest of base and pkg content to make the
  // full content object
  const content = { ...baseContent, ...pkgContent }

  // set some defaults on content that can be overwritten unlike
  // derived values which are calculated from other config
  const contentDefaults = {}

  if (Array.isArray(content.ciVersions)) {
    const parsed = parseCIVersions(content.ciVersions)
    contentDefaults.engines = parsed.engines
    content.ciVersions = parsed.targets
    log.verbose('config ci', parsed)
  }

  if (gitUrl) {
    contentDefaults.repository = {
      type: 'git',
      url: gitUrl,
      ...(pkgRelPath ? { directory: pkgRelPath } : {}),
    }
  }

  contentDefaults.ignorePaths = uniq(
    [...ignorePaths, ...(content.distPaths || [])].map(negatePath)
  ).sort()

  log.verbose('config', 'defaults', contentDefaults)

  return {
    ...defaults(content, contentDefaults),
    ...derived,
  }
}

module.exports = getConfig
module.exports.getPkgConfig = getPkgConfig
