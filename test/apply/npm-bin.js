const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('custom npm path', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npm: '/path/to/npm',
      },
    },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  t.equal(scripts.posttest, 'node /path/to/npm run lint')
})

t.test('relative npm bin with workspaces', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npm: 'cli.js',
      },
    },
    workspaces: { a: '@name/aaaa', b: 'bbb' },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  const { scripts: scriptsA } = await s.readJson(join(s.workspaces.a, 'package.json'))
  const { scripts: scriptsB } = await s.readJson(join(s.workspaces.b, 'package.json'))
  t.equal(scripts.posttest, 'node cli.js run lint')
  t.equal(scriptsA.posttest, 'node ../../cli.js run lint')
  t.equal(scriptsB.posttest, 'node ../../cli.js run lint')
})
