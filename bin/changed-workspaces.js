#!/usr/bin/env node

const { join, relative } = require('path')
const git = require('@npmcli/git')
const mapWorkspaces = require('@npmcli/map-workspaces')

const getDiffFiles = (base, head) => git.spawn([
  '--no-pager',
  'diff',
  '--name-only',
  base,
  head,
])

const getShaFiles = (sha) => git.spawn([
  '--no-pager',
  'diff-tree',
  '--no-commit-id',
  '--name-only',
  '-r',
  sha,
])

const main = async ({ cwd, args }) => {
  let sha = null
  let base = null
  let head = null

  if (args.length === 1) {
    sha = args[0]
  } else {
    base = args[0]
    head = args[1]
  }

  const wsMap = await mapWorkspaces({
    cwd,
    pkg: require(join(cwd, 'package.json')),
  })
  const workspaces = [...wsMap.entries()].map(([name, path]) => ({
    name,
    path: relative(cwd, path),
  }))

  // Always run everything on release branches
  if (head?.startsWith('release-please--branches--')) {
    return ['-iwr', ...workspaces.map(ws => `-w '${ws.name}'`)].join(' ')
  }

  let changedRoot = false
  const changedWorkspaces = new Set()

  const changedFiles = await (sha ? getShaFiles(sha) : getDiffFiles(base, head))
    .then((res) => res.stdout.trim().split('\n').filter(Boolean))

  for (const file of changedFiles) {
    for (const ws of workspaces) {
      if (file.startsWith(ws.path)) {
        changedWorkspaces.add(`-w '${ws.name}'`)
        continue
      }
    }
    changedRoot = true
  }

  return [changedRoot ? '-iwr' : '', ...changedWorkspaces.values()].join(' ').trim()
}

module.exports = main({
  cwd: process.cwd(),
  args: process.argv.slice(2),
})
  .then((r) => process.stdout.write(r))
  .catch((err) => {
    console.error(err.stack)
    process.exitCode = 1
  })
