const t = require('tap')
const fs = require('fs')
const { join } = require('path')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.readdir

t.test('turn off repo', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('turn off module', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootModule: false,
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('turn off all', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('workspaces', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
        workspaceRepo: false,
        workspaces: ['@aaa/aaa', '@bbb/bbb', 'd'],
      },
    },
    workspaces: {
      a: '@aaa/aaa',
      b: '@bbb/bbb',
      c: {
        templateOSS: {
          // this has no effect since its filtered out at root
          workspaceRepo: true,
        },
      },
      d: {
        templateOSS: {
          // turn on repo to override root config
          workspaceRepo: true,
        },
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('private workspace', async (t) => {
  const s = await setup(t, {
    package: {},
    workspaces: {
      a: { private: true },
      b: {},
    },
  })
  await s.apply()

  const pkg = await s.readJson(join('workspaces', 'b', 'package.json'))
  const privatePkg = await s.readJson(join('workspaces', 'a', 'package.json'))

  t.ok(pkg.scripts.prepublishOnly)
  t.ok(pkg.scripts.postversion)

  t.notOk(privatePkg.scripts.prepublishOnly)
  t.ok(privatePkg.scripts.postversion)

  t.equal(pkg.scripts.prepublishOnly, privatePkg.scripts.postversion)

  const rp = s.join('.github', 'workflows')
  t.ok(fs.existsSync(join(rp, 'release-please.yml')))
  t.ok(fs.existsSync(join(rp, 'release-please-b.yml')))
  t.notOk(fs.existsSync(join(rp, 'release-please-a.yml')))
})
