const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('applies version', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'empty',
        defaultContent: false,
      },
    },
    workspaces: {
      a: 'a',
    },
    testdir: {
      empty: {},
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  const pkgA = await s.readJson(join(s.workspaces.a, 'package.json'))

  t.equal(pkg.templateOSS.version, setup.pkgVersion)
  t.equal(pkgA.templateOSS.version, setup.pkgVersion)
})
