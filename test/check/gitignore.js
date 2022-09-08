const t = require('tap')
const setup = require('../setup.js')

t.test('allow package-lock', async (t) => {
  const s = await setup.git(t, {
    ok: true,
    package: {
      templateOSS: {
        lockfile: true,
      },
    },
  })

  await s.writeFile('package-lock.json', '{}')

  await s.gca()
  await s.apply()
  t.strictSame(await s.check(), [])
})
