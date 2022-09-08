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

t.test('turn off root', async (t) => {
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

t.test('turn off add/rm types', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: {
          rm: false,
        },
        rootModule: {
          add: false,
        },
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('turn off specific files', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: {
          add: {
            '.commitlintrc.js': false,
          },
          rm: {
            '.github/workflows/release-test.yml': false,
          },
        },
        rootModule: {
          add: {
            '.eslintrc.js': false,
          },
          rm: {
            '.eslintrc.!(js|local.*)': false,
          },
        },
      },
    },
    testdir: {
      '.github': {
        workflows: {
          'release-test.yml': 'exists',
        },
      },
      '.eslintrc.yml': 'exists',
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})

t.test('workspaces with relative content path', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
        defaultContent: false,
      },
    },
    workspaces: {
      a: {
        templateOSS: {
          content: '../../content_dir2',
          defaultContent: false,
        },
      },
    },
    testdir: {
      content_dir: { 'index.js': 'module.exports={}' },
      content_dir2: { 'index.js': 'module.exports={}' },
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
      b: 'b',
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdir())
})
