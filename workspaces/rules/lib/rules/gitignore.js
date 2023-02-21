const { resolve, basename } = require('path')
const fs = require('fs/promises')
const { existsSync } = require('fs')
const git = require('@npmcli/git')

// The problem we are trying to solve is when a new .gitignore file
// is copied into an existing repo, there could be files already checked in
// to git that are now ignored by new gitignore rules. We want to warn
// about these files.
const run = async ({ rootPkg, pkg, log }) => {
  // use the root to detect a git repo but the project directory (path) for the
  // ignore check
  const ignoreFile = resolve(pkg.path, '.gitignore')
  if (!await git.is({ cwd: rootPkg.path }) || !existsSync(ignoreFile)) {
    log.verbose('no git or no gitignore')
    return null
  }

  log.verbose(`using ignore file ${ignoreFile}`)

  const res = await git.spawn([
    'ls-files',
    '--cached',
    '--ignored',
    // https://git-scm.com/docs/git-ls-files#_exclude_patterns
    `--${pkg.isRoot ? 'exclude-from' : 'exclude-per-directory'}=${basename(ignoreFile)}`,
  ], { cwd: pkg.path })

  log.verbose('ls-files', res)

  const files = res.stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(f => resolve(pkg.path, f))
    .filter((f) => existsSync(f))

  if (!files.length) {
    return null
  }

  const ignores = (await fs.readFile(ignoreFile))
    .toString()
    .split(/\r?\n/)
    .filter((l) => l && !l.trim().startsWith('#'))

  const relIgnore = pkg.relativeToRoot(ignoreFile)

  return {
    title: `The following files are tracked by git but matching a pattern in ${relIgnore}:`,
    body: files.map(pkg.relativeToRoot),
    solution: ['move files to not match one of the following patterns:', ...ignores],
  }
}

module.exports = {
  name: 'gitignore',
  check: {
    run,
  },
}
