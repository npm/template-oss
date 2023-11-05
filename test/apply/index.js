const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('turn off root files', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
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
  t.notOk(await s.exists('.commitlintrc.js'))
  t.notOk(await s.exists('.eslintrc.js'))
  t.ok(await s.exists('.github', 'workflows', 'release-test.yml'))
  t.ok(await s.exists('.eslintrc.yml'))
})

t.test('turn off root rm only', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: {
          rm: false,
        },
        rootModule: {
          rm: false,
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
  t.ok(await s.exists('.commitlintrc.js'))
  t.ok(await s.exists('.eslintrc.js'))
  t.ok(await s.exists('.github', 'workflows', 'release-test.yml'))
  t.ok(await s.exists('.eslintrc.yml'))
})

t.test('turn off root add only', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: {
          add: false,
        },
        rootModule: {
          add: false,
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
  t.notOk(await s.exists('.commitlintrc.js'))
  t.notOk(await s.exists('.eslintrc.js'))
  t.notOk(await s.exists('.github', 'workflows', 'release-test.yml'))
  t.notOk(await s.exists('.eslintrc.yml'))
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
  t.notOk(await s.exists('.commitlintrc.js'))
  t.notOk(await s.exists('.eslintrc.js'))
  t.ok(await s.exists('.github', 'workflows', 'release-test.yml'))
  t.ok(await s.exists('.eslintrc.yml'))
})

t.test('root can set workspace files', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        workspaceModule: {
          add: { '.eslintrc.js': false },
          rm: { '.npmrc': false },
        },
      },
    },
    workspaces: {
      a: 'a',
    },
    testdir: {
      workspaces: {
        a: {
          '.npmrc': 'exists',
        },
      },
    },
  })
  await s.apply()
  t.notOk(await s.exists(s.workspaces.a, '.eslintrc.js'))
  t.ok(await s.exists(s.workspaces.a, '.npmrc'))
})

t.test('workspace config can override root', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        workspaceModule: {
          add: { '.eslintrc.js': false },
          rm: { '.npmrc': false },
        },
      },
    },
    workspaces: {
      a: {
        templateOSS: {
          workspaceModule: {
            add: { '.eslintrc.js': 'eslintrc-js.hbs' },
            rm: { '.npmrc': true },
          },
        },
      },
    },
    testdir: {
      workspaces: {
        a: {
          '.npmrc': 'exists',
        },
      },
    },
  })
  await s.apply()
  t.ok(await s.exists(s.workspaces.a, '.eslintrc.js'))
  t.notOk(await s.exists(s.workspaces.a, '.npmrc'))
})

t.test('workspaces can override content', async (t) => {
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
          defaultContent: true,
        },
      },
    },
    testdir: {
      content_dir: { 'index.js': 'module.exports={}' },
      content_dir2: {
        'x-js.hbs': 'exists',
        'index.js': 'module.exports={workspaceRepo:{add:{"x.js":"x-js.hbs"}}}',
      },
    },
  })
  await s.apply()
  t.notOk(await s.exists('.eslintrc.js'))
  t.ok(await s.exists(s.workspaces.a, '.eslintrc.js'))
  t.ok(await s.exists('x.js'))
})

t.test('content can override partials', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
      },
    },
    testdir: {
      content_dir: {
        'index.js': `module.exports={
          rootRepo:{
            add:{'.github/workflows/ci-release.yml': 'ci-release-yml.hbs'}
          }
        }`,
        'ci-release-yml.hbs': '{{> ciReleaseYml }}\n  job: 1',
        '_step-deps-yml.hbs': '- run: INSTALL\n',
        '_step-test-yml.hbs': '- run: TEST\n{{> defaultStepTestYml }}\n',
      },
    },
  })
  await s.apply()
  const ci = await s.readFile(join('.github', 'workflows', 'ci.yml'))
  const release = await s.readFile(join('.github', 'workflows', 'ci-release.yml'))
  t.ok(ci.includes('- run: INSTALL'))
  t.ok(ci.includes('- run: TEST'))
  t.notOk(ci.includes('npm i --ignore-scripts --no-audit --no-fund'))
  t.ok(ci.includes('npm test --ignore-scripts'))
  t.ok(release.includes('job: 1'))
})

t.test('content can extend files', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
      },
    },
    testdir: {
      content_dir: {
        // eslint-disable-next-line max-len
        'index.js': 'module.exports={rootRepo:{add:{".github/workflows/release.yml": "release-yml.hbs"}}}',
        'release-yml.hbs': '{{> ciReleaseYml}}\n  smoke-publish:\n    runs-on: ubuntu-latest',
      },
    },
  })
  await s.apply()
  const release = await s.readFile(join('.github', 'workflows', 'release.yml'))
  t.ok(release.includes('smoke-publish'))
})

t.test('config via multiple locations', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        a: 'root-a',
        b: 'root-b',
        content: 'root-content',
      },
    },
    workspaces: {
      a: {
        templateOSS: {
          a: 'ws-a',
          b: 'ws-b',
          content: 'ws-content',
        },
      },
    },
    testdir: {
      'root-content': {
        root: '{{rootNpmPath}}-{{a}}-{{b}}-{{c}}',
        'index.js': 'module.exports={rootRepo:{add:{"root.txt":"root"}},c:"root-c"}',
      },
      workspaces: {
        a: {
          'ws-content': {
            ws: '{{rootNpmPath}}-{{a}}-{{b}}-{{c}}',
            'index.js': 'module.exports={workspaceRepo:{add:{"ws.txt":"ws"}},c:"ws-c"}',
          },
        },
      },
    },
  })
  await s.apply()

  const root = await s.readFile('root.txt')
  const ws = await s.readFile(join('ws.txt'))

  t.equal(root.split('\n').slice(-1)[0], 'npm-root-a-root-b-root-c')
  t.equal(ws.split('\n').slice(-1)[0], 'npm-ws-a-ws-b-ws-c')
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

  t.notOk(pkg.scripts.prepublishOnly)
  t.notOk(pkg.scripts.postversion)
  t.notOk(privatePkg.scripts.prepublishOnly)
  t.notOk(privatePkg.scripts.postversion)

  t.equal(rpManifest['.'], '1.0.0')
  t.equal(rpManifest['workspaces/b'], '1.0.0')
  t.notOk(rpManifest['workspaces/a'])
  t.ok(rpConfig.packages['.'])
  t.ok(rpConfig.packages['workspaces/b'])
  t.notOk(rpConfig.packages['workspaces/a'])

  t.ok(await s.exists('.github', 'workflows', 'release.yml'))
  t.notOk(await s.exists('.github', 'workflows', 'release-please-b.yml'))
  t.notOk(await s.exists('.github', 'workflows', 'release-please-a.yml'))
})
