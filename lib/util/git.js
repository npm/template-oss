const hgi = require('hosted-git-info')
const git = require('@npmcli/git')
const { minimatch } = require('minimatch')

const cache = new Map()

const tryGit = async (path, ...args) => {
  if (!await git.is({ cwd: path })) {
    throw new Error('no git')
  }
  const key = [path, ...args].join(',')
  if (cache.has(key)) {
    return cache.get(key)
  }
  const res = git.spawn(args, { cwd: path }).then(r => r.stdout.trim())
  cache.set(key, res)
  return res
}

// parse a repo from a git origin into a format
// for a package.json#repository object
const getRemoteUrl = async (path, remote) => {
  try {
    const urlStr = await tryGit(path, 'remote', 'get-url', remote)
    const { domain, user, project } = hgi.fromUrl(urlStr)
    const url = new URL(`https://${domain}`)
    url.pathname = `/${user}/${project}.git`
    return url.toString()
  } catch {
    // errors are ignored
  }
}

const getUrl = async (path) => {
  return (await getRemoteUrl(path, 'upstream')) ?? (await getRemoteUrl(path, 'origin'))
}

const getBranches = async (path, branchPatterns) => {
  let matchingBranches = new Set()
  let matchingPatterns = new Set()

  try {
    const res = await tryGit(path, 'ls-remote', '--heads', 'origin').then(r => r.split('\n'))
    const remotes = res.map((h) => h.match(/refs\/heads\/(.*)$/)).filter(Boolean).map(h => h[1])
    for (const branch of remotes) {
      for (const pattern of branchPatterns) {
        if (minimatch(branch, pattern)) {
          matchingBranches.add(branch)
          matchingPatterns.add(pattern)
        }
      }
    }
  } catch {
    matchingBranches = new Set(branchPatterns.filter(b => !b.includes('*')))
    matchingPatterns = new Set(branchPatterns)
  }

  return {
    branches: [...matchingBranches],
    patterns: [...matchingPatterns],
  }
}

const defaultBranch = async (path) => {
  try {
    const remotes = await tryGit(path, 'remote', 'show', 'origin')
    return remotes.match(/HEAD branch: (.*)$/m)?.[1]
  } catch {
    // ignore errors
  }
}

module.exports = {
  getUrl,
  getBranches,
  defaultBranch,
}
