const log = require('proc-log')
const { EOL } = require('os')
const { resolve, relative, basename } = require('path')
const fs = require('@npmcli/fs')
const git = require('@npmcli/git')

const NAME = 'check-gitignore'

// The problem we are trying to solve is when a new .gitignore file
// is copied into an existing repo, there could be files already checked in
// to git that are now ignored by new gitignore rules. We want to warn
// about these files.
const run = async ({ root, path, config }) => {
  log.verbose(NAME, { root, path })

  const relativeToRoot = (f) => relative(root, resolve(path, f))

  // use the root to detect a git repo but the project directory (path) for the
  // ignore check
  const ignoreFile = resolve(path, '.gitignore')
  if (!await git.is({ cwd: root }) || !await fs.exists(ignoreFile)) {
    log.verbose(NAME, 'no git or no gitignore')
    return null
  }

  log.verbose(NAME, `using ignore file ${ignoreFile}`)

  const res = await git.spawn([
    'ls-files',
    '--cached',
    '--ignored',
    // https://git-scm.com/docs/git-ls-files#_exclude_patterns
    `--${config.isRoot ? 'exclude-from' : 'exclude-per-directory'}=${basename(ignoreFile)}`,
  ], { cwd: path })

  log.verbose(NAME, 'ls-files', res)

  // TODO: files should be filtered if they have already been moved/deleted
  // but not committed. Currently you must commit for this check to pass.
  const files = res.stdout
    .trim()
    .split('\n')
    .filter(Boolean)

  if (!files.length) {
    return null
  }

  const ignores = (await fs.readFile(ignoreFile))
    .toString()
    .split(EOL)
    .filter((l) => l && !l.trim().startsWith('#'))

  const relIgnore = relativeToRoot(ignoreFile)

  return {
    title: `The following files are tracked by git but matching a pattern in ${relIgnore}:`,
    body: files.map(relativeToRoot),
    solution: ['move files to not match one of the following patterns:', ...ignores],
  }
}

module.exports = {
  run,
  when: ({ config: c }) => c.applyModule,
  name: NAME,
}
