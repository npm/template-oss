const { join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const copyContent = require('../lib/content/index.js')

t.test('copies content', async (t) => {
  const root = t.testdir()

  await copyContent(root)
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

  await copyContent(root)
  for (const target of Object.keys(copyContent.content)) {
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
