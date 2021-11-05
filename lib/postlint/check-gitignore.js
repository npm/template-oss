const path = require('path')
const fs = require('fs')
const { sync: which } = require('which')
const { spawnSync } = require('child_process')

// The problem we are trying to solve is when a new .gitignore file
// is copied into an existing repo, there could be files already checked in
// to git that are now ignored by new gitignore rules. We want to warn
// about these files.
const check = async (root) => {
  const git = path.resolve(root, '.git')
  const gitignore = path.resolve(root, '.gitignore')

  if (!fs.existsSync(git)) {
    return []
  }

  if (!fs.existsSync(gitignore)) {
    throw new Error(`${gitignore} must exist to run npm-template-check`)
  }

  const res = spawnSync(which('git'), [
    'ls-files',
    '--cached',
    '--ignored',
    // The .gitignore file has already been placed by now with the postinstall
    // script so when this script runs via postlint, it can use that file
    `--exclude-from=${gitignore}`,
  ], { encoding: 'utf-8', cwd: root })

  const files = res.stdout
    .trim()
    .split('\n')
    .filter(Boolean)

  if (!files.length) {
    return []
  }

  const relativeGitignore = path.relative(root, gitignore)
  const ignores = fs.readFileSync(gitignore)
    .toString()
    .split('\n')
    .filter((l) => l && !l.trim().startsWith('#'))

  const message = [
    `The following files are tracked by git but matching a pattern in ${relativeGitignore}:`,
    ...files.map((f) => `  ${f}`),
  ].join('\n')

  const solution = [
    'Move files to not match one of these patterns:',
    ...ignores.map((i) => `  ${i}`),
  ].join('\n')

  return [{ message, solution }]
}

module.exports = check
