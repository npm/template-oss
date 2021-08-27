const { join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const patchPackage = require('../lib/package.js')

t.test('can patch a package.json', async (t) => {
  const pkg = {
    name: '@npmcli/foo',
    version: '1.0.0',
    author: 'someone else',
    files: [],
    license: 'MIT',
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  await patchPackage(project)

  const contents = await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  })
  t.match(JSON.parse(contents), patchPackage.changes, 'all changes were applied')
})
