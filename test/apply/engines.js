const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('can set engines and ci separately', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        engines: '>=10',
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  const ci = await s.readFile(join('.github', 'workflows', 'ci.yml'))

  t.equal(pkg.engines.node, '>=10')
  t.notOk(ci.includes('- 10'))
  t.notOk(ci.includes('- 12'))
})

t.test('latest ci versions', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        ciVersions: 'latest',
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')

  t.equal(pkg.engines.node, '>=18.0.0')
})

t.test('latest ci versions in workspace', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        ciVersions: ['12.x', '14.x', '16.x'],
      },
    },
    workspaces: {
      a: {
        templateOSS: {
          ciVersions: 'latest',
        },
      },
    },
    testdir: {
      content: {
        'source.json': '{ "node": {{{ json engines }}} }',
        'index.js': `module.exports={
          rootRepo:{add:{'target.json':'source.json'}},
          workspaceRepo:{add:{'target-{{ pkgNameFs }}.json':'source.json'}}
        }`,
      },
    },
  })
  await s.apply()

  const root = await s.readJson('target.json')
  const workspace = await s.readJson('target-a.json')

  t.equal(root.node, '^12.0.0 || ^14.0.0 || >=16.0.0')
  t.equal(workspace.node, '>=16.0.0')
})
