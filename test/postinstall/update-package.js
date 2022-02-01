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
    templateOSS: {
      version: TEMPLATE_VERSION,
    },
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

t.test('returns true when templateVersion matches own version when forced', async (t) => {
  const pkg = {
    name: '@npmcli/foo',
    templateOSS: {
      version: TEMPLATE_VERSION,
    },
    version: '1.0.0',
    author: 'someone else',
    files: [],
    license: 'MIT',
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const needsAction = await patchPackage(project, undefined, { force: true })
  t.equal(needsAction, true, 'returned true')

  const contents = await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  })
  const parsed = JSON.parse(contents)
  t.match(parsed, patchPackage.changes, 'all changes were applied')
})

t.test('doesnt set templateVersion on own repo', async (t) => {
  const pkg = {
    name: TEMPLATE_NAME,
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const needsAction = await patchPackage(project)
  t.equal(needsAction, true, 'needs action')

  const contents = JSON.parse(await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  }))
  const version = (contents.templateOSS) ?
    contents.templateOSS.version : contents.templateVersion
  t.equal(version, undefined, 'did not get template version')
})

t.test('only sets templateVersion on root pkg when configured', async (t) => {
  const pkgWithWorkspaces = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        applyRootRepoFiles: false,
        applyWorkspaceRepoFiles: true,
        applyRootModuleFiles: false,

        workspaces: ['amazinga'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
    },
  }
  const root = t.testdir(pkgWithWorkspaces)
  await patchPackage(root, root, {
    applyRootRepoFiles: false,
    applyWorkspaceRepoFiles: true,
    applyRootModuleFiles: false,
  })

  const contents = JSON.parse(await fs.readFile(join(root, 'package.json'), {
    encoding: 'utf8',
  }))

  t.not(contents.templateOSS.version, undefined, 'should set templateVersion')
  t.equal(contents.author, undefined, 'should not set other fields')
})

t.test('converts template Version', async (t) => {
  const pkg = {
    name: 'testpkg',
    templateVersion: '2.0.0',
  }

  const project = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const needsAction = await patchPackage(project)
  t.equal(needsAction, true, 'needs action')

  const contents = JSON.parse(await fs.readFile(join(project, 'package.json'), {
    encoding: 'utf8',
  }))
  t.equal(contents.templateVersion, undefined, 'did not get template version')
  t.equal(contents.templateOSS.version, TEMPLATE_VERSION, 'did not get template version')
})
