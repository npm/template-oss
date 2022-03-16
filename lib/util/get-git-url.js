const hgi = require('hosted-git-info')
const git = require('@npmcli/git')

// parse a repo from a git origin into a format
// for a package.json#repository object
const getRepo = async (path) => {
  if (!await git.is({ cwd: path })) {
    return
  }

  try {
    const res = await git.spawn([
      'remote',
      'get-url',
      'origin',
    ], { cwd: path })
    const { domain, user, project } = hgi.fromUrl(res.stdout.trim())
    const url = new URL(`https://${domain}`)
    url.pathname = `/${user}/${project}.git`
    return url.toString()
  } catch {}
}

module.exports = getRepo
