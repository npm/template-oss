const t = require('tap')
const { existsSync } = require('fs')
const setup = require('../setup.js')

t.test('root only', async (t) => {
  const prvt = { private: true }
  const cases = [
    [{}, { plugins: false, pr: true }],
    [{ workspaces: { a: 'a' } }, { plugins: true, pr: true }],
    [{ workspaces: { a: prvt } }, { plugins: false, pr: true }],
    [{ package: prvt }, { plugins: false, pr: false }],
    [{ package: prvt, workspaces: { a: 'a' } }, { plugins: true, pr: true }],
    [{ package: prvt, workspaces: { a: prvt } }, { plugins: false, pr: false }],
  ]

  for (const [config, expected] of cases) {
    await t.test(JSON.stringify(config), async t => {
      const s = await setup(t, config)
      await s.apply()

      const releaseConfig = await s.readJson('release-please-config.json').catch(() => ({}))
      const pr = existsSync(s.join('.github', 'workflows', 'pull-request.yml'))

      t.strictSame(releaseConfig.plugins, expected.plugins ? ['node-workspace'] : undefined)
      t.equal(pr, expected.pr)
    })
  }
})
