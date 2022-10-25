const t = require('tap')
const setup = require('../setup.js')

t.test('no plugin for root only', async (t) => {
  const s = await setup(t)
  await s.apply()

  const releaseConfig = await s.readJson('release-please-config.json')
  t.equal(releaseConfig.plugins, undefined)
})

t.test('has plugin for workspace', async (t) => {
  const s = await setup(t, {
    workspaces: {
      a: 'a',
    },
  })
  await s.apply()

  const releaseConfig = await s.readJson('release-please-config.json')
  t.strictSame(releaseConfig.plugins, ['node-workspace'])
})

t.test('no plugin for private workspace', async (t) => {
  const s = await setup(t, {
    workspaces: {
      a: {
        private: true,
      },
    },
  })
  await s.apply()

  const releaseConfig = await s.readJson('release-please-config.json')
  t.equal(releaseConfig.plugins, undefined)
})
