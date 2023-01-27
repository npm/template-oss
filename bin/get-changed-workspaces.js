#!/usr/bin/env node

const { join, relative } = require('path')
const git = require('@npmcli/git')
const mapWorkspaces = require('@npmcli/map-workspaces')

const main = async ({ cwd, base, head }) => {
  const pkg = require(join(cwd, 'package.json'))

  const workspaces = []
  for (const [name, path] of (await mapWorkspaces({ pkg, cwd })).entries()) {
    workspaces.push({ name, path: relative(cwd, path) })
  }

  const changedWorkspaces = new Set()

  const changesFiles = await git.spawn([
    '--no-pager',
    'diff',
    '--name-only',
    base,
    head,
  ]).then((res) => res.stdout.trim().split('\n').filter(Boolean))

  for (const file of changesFiles) {
    for (const ws of workspaces) {
      if (file.startsWith(ws.path)) {
        changedWorkspaces.add(`-w '${ws.name}'`)
        continue
      }
    }
    changedWorkspaces.add('-iwr')
  }

  return [...changedWorkspaces.values()].join(' ')
}

module.exports = main({
  cwd: process.cwd(),
  base: process.env.GITHUB_BASE_REF,
  head: process.env.GITHUB_HEAD_REF,
})
  .then(console.log)
  .catch((err) => {
    console.error(err.stack)
    process.exitCode = 1
  })
