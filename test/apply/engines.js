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
