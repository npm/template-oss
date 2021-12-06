const { join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const copyContent = require('../../lib/postinstall/copy-content.js')

t.test('copies content', async (t) => {
  const root = t.testdir()

  await copyContent(root, root)
  for (let target of Object.keys(copyContent.content)) {
    target = join(root, target)
    await t.resolves(fs.stat(target))
  }
})

t.test('removes files', async (t) => {
  const content = {
    '.eslintrc.json': '{}',
    '.eslintrc.yml': '',
    '.eslintrc.local.json': '{}',
    'something.txt': '',
    LICENSE: '',
    'LICENSE.txt': '',
  }
  const keepContent = [
    '.eslintrc.local.json',
    'something.txt',
  ]
  const root = t.testdir(content)

  await copyContent(root, root)
  for (const target of Object.keys(copyContent.content)) {
    const fullTarget = join(root, target)
    await t.resolves(fs.stat(fullTarget), `copied ${target}`)
  }
  for (const target of Object.keys(copyContent.rootContent)) {
    const fullTarget = join(root, target)
    await t.resolves(fs.stat(fullTarget), `copied ${target}`)
  }

  for (const target in content) {
    const fullTarget = join(root, target)
    if (keepContent.find((f) => f === target)) {
      await t.resolves(fs.stat(fullTarget), `left existing ${target}`)
    } else {
      await t.rejects(fs.stat(fullTarget), { code: 'ENOENT' }, `removed ${target}`)
    }
  }
})

t.test('handles workspaces', async (t) => {
  const content = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        includeRoot: false,
        workspaces: ['workspace/a', 'workspace/b'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
      b: {
        'package.json': JSON.stringify({
          name: 'amazingb',
        }),
      },
    },
  }
  const root = t.testdir(content)
  const workspacea = join(root, 'workspace', 'a')
  await copyContent(workspacea, root)

  // should have made the workspace action in the root
  await t.resolves(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  // change should have applied to the workspace, not the root
  await t.rejects(fs.stat(join(root, '.eslintrc.js')))
  await t.resolves(fs.stat(join(root, 'workspace', 'a', '.eslintrc.js')))
})
