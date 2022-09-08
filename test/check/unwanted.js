const t = require('tap')
const setup = require('../setup.js')

t.test('unwanted can be overriden with allow', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      dependencies: {
        eslint: '^8.0.0',
      },
      templateOSS: {
        allowedPackages: [
          'eslint',
        ],
      },
    },
  })

  await s.apply()
  t.strictSame(await s.check(), [])
})
