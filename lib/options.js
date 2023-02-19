const { posix, win32 } = require('path')
const getGitUrl = require('./get-git-url')

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

const getPkgOptions = async ({ pkg, rootPkg }) => {
  const isRoot = rootPkg.path === pkg.path
  const isWorkspace = !isRoot

  const isPrivate = !!pkg.json.private
  const isPublic = !isPrivate

  const relativeToRoot = (p) => posix.relative(rootPkg.path, p)
  const relativeToPkg = (p) => posix.relative(pkg.path, p)

  const relPath = relativeToRoot(pkg.path)

  const repository = await getGitUrl(rootPkg.path).then((gitUrl) => gitUrl && {
    type: 'git',
    url: gitUrl,
    ...(!isRoot ? { directory: relPath } : {}),
  })

  return {
    ...pkg,
    isRoot,
    isWorkspace,
    isPrivate,
    isPublic,
    repository,
    // this is all with posix separators for writing to files like
    // workflows which require / as a separator
    relativeToRoot,
    relativeToPkg,
    workspacePaths: (pkg.json.workspaces || []).map(deglob),
    workspaceGlobs: (pkg.json.workspaces || []).map(posixGlob),
    relPath,
    relToRoot: relativeToPkg(rootPkg.path),
    dir: posixDir(relPath),
    glob: posixGlob(relPath),
    name: pkg.json.name,
    version: pkg.json.version,
    nameFs: pkg.json.name.replace(/\//g, '-').replace(/@/g, ''),
    flags: isWorkspace ? `--workspace="${pkg.json.name}"` : '--include-workspace-root',
  }
}

// everything is an object or an array of objects that has already
// been run through the above getOptions function
const getRepoOptions = ({ pkgs, wsPkgs }) => {
  const isMono = !!wsPkgs.length
  const isMonoPublic = isMono && !!wsPkgs.find(p => p.isPublic)

  const isAllPrivate = pkgs.every(p => p.isPrivate)
  const publicPkgs = pkgs.filter(p => !p.isPrivate)
  const privatePkgs = pkgs.filter(p => p.isPrivate)

  return {
    isMono,
    isAllPrivate,
    isMonoPublic,
    publicPkgs,
    privatePkgs,
  }
}

module.exports = {
  getRepoOptions,
  getPkgOptions,
}
