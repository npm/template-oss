const { join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const {
  version: TEMPLATE_VERSION,
  name: TEMPLATE_NAME,
} = require('../../package.json')

const patchPackage = require('../../lib/postinstall/update-package.js')

t.test('can patch a package.json', async (t) => {
  const pkg = {
    name: '@npmcli/foo',
    version: '1.0.0',
    author: 'someone else',
    files: [],
    license: 'MIT',
    scripts: {
      foo: 'echo bar',
    },
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const needsAction = await patchPackage(project)
  t.equal(needsAction, true, 'returned true')

  const contents = await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  })
  const parsed = JSON.parse(contents)
  t.match(parsed, patchPackage.changes, 'all changes were applied')
  t.equal(parsed.scripts.foo, 'echo bar', 'did not remove existing script')
})

t.test('returns false when templateVersion matches own version', async (t) => {
  const pkg = {
    name: '@npmcli/foo',
    templateVersion: TEMPLATE_VERSION,
    version: '1.0.0',
    author: 'someone else',
    files: [],
    license: 'MIT',
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const needsAction = await patchPackage(project)
  t.equal(needsAction, false, 'returned false')

  const contents = await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  })
  t.notMatch(JSON.parse(contents), patchPackage.changes, 'changes were NOT applied')
})
