const t = require('tap')
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
