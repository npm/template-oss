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

t.test('workspaces only (like npm/cli)', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
      },
    },
    workspaces: { a: 'a', b: 'b' },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('private workspace', async (t) => {
  const s = await setup(t, {
    package: {
      name: 'root-pkg',
    },
    workspaces: {
      a: { private: true },
      b: {},
    },
    testdir: {
      '.github': {
        workflows: {
          'release-please-a.yml': 'old yaml file',
          'release-please-b.yml': 'old yaml file',
        },
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson(join('workspaces', 'b', 'package.json'))
  const privatePkg = await s.readJson(join('workspaces', 'a', 'package.json'))
  const rpManifest = await s.readJson('.release-please-manifest.json')
  const rpConfig = await s.readJson('release-please-config.json')

  t.ok(pkg.scripts.prepublishOnly)
  t.ok(pkg.scripts.postversion)

  t.notOk(privatePkg.scripts.prepublishOnly)
  t.ok(privatePkg.scripts.postversion)

  t.equal(pkg.scripts.prepublishOnly, privatePkg.scripts.postversion)

  t.equal(rpManifest['.'], '1.0.0')
  t.equal(rpManifest['workspaces/b'], '1.0.0')
  t.notOk(rpManifest['workspaces/a'])
  t.ok(rpConfig.packages['.'])
  t.ok(rpConfig.packages['workspaces/b'])
  t.notOk(rpConfig.packages['workspaces/a'])

  const rp = s.join('.github', 'workflows')
  t.ok(fs.existsSync(join(rp, 'release-please.yml')))
  t.notOk(fs.existsSync(join(rp, 'release-please-b.yml')))
  t.notOk(fs.existsSync(join(rp, 'release-please-a.yml')))
})
