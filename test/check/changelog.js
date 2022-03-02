const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.checks

t.test('will report incorrect changelog', async (t) => {
  const s = await setup(t, {
    ok: true,
    testdir: {
      'CHANGELOG.md': '# changelorg\n\n#',
    },
  })

  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})
