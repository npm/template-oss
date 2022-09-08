const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.checks

t.test('check empty dir', async (t) => {
  const s = await setup(t)
  await t.resolveMatchSnapshot(s.check())
})

t.test('workspaces with empty dir', async (t) => {
  const s = await setup(t, {
    workspaces: { a: '@name/aaaa', b: 'bbb' },
  })
  await t.resolveMatchSnapshot(s.check())
})

t.test('not ok without required', async (t) => {
  const s = await setup(t)
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('changelog', async (t) => {
  const s = await setup(t, {
    ok: true,
    testdir: {
      'CHANGELOG.md': '# changelorg\n\n#',
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('gitignore', async (t) => {
  const s = await setup.git(t, { ok: true })

  await s.writeFile('ignorethis', 'empty')
  await s.writeFile('package-lock.json', '{}')

  await s.gca()
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('gitignore with workspaces workspace', async (t) => {
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

t.test('unwanted', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      dependencies: {
        eslint: '^8.0.0',
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})
