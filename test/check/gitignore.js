const { join } = require('path')
const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.checks

t.test('will report tracked files in gitignore', async (t) => {
  const s = await setup.git(t, { ok: true })

  await s.writeFile('ignorethis', 'empty')
  await s.writeFile('package-lock.json', '{}')

  await s.gca()
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('will report tracked files in gitignore workspace', async (t) => {
  const s = await setup.git(t, {
    ok: true,
    workspaces: {
      a: '@aaa/a',
      b: 'b',
    },
  })

  await s.writeFile('ignorethis', 'empty')
  await s.writeFile(join(s.workspaces.a, 'wsafile'), 'empty')
  await s.writeFile(join(s.workspaces.b, 'wsbfile'), 'empty')

  await s.gca()
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('works with workspaces in separate dirs', async (t) => {
  const s = await setup.git(t, {
    ok: true,
    package: {
      workspaces: ['workspace-a', 'workspace-b'],
    },
    testdir: {
      'workspace-a': {
        'package.json': JSON.stringify({
          name: 'a',
          ...setup.okPackage(),
        }),
      },
      'workspace-b': {
        'package.json': JSON.stringify({
          name: 'b',
          ...setup.okPackage(),
        }),
      },
    },
  })

  await s.writeFile('ignorethis', 'empty')
  await s.writeFile(join('workspace-a', 'wsafile'), 'empty')
  await s.writeFile(join('workspace-b', 'wsbfile'), 'empty')

  await s.gca()
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('allow package-lock', async (t) => {
  const s = await setup.git(t, {
    ok: true,
    package: {
      templateOSS: {
        lockfile: true,
      },
    },
  })

  await s.writeFile('package-lock.json', '{}')

  await s.gca()
  await s.apply()
  t.strictSame(await s.check(), [])
})
