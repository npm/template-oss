const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.readdirSource

t.test('default', async (t) => {
  const s = await setup(t)
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('workspaces + everything', async (t) => {
  const s = await setup(t, {
    workspaces: { a: '@name/aaaa', b: 'bbb' },
    testdir: {
      '.eslintrc.json': 'DELETE',
      '.eslintrc.local.yml': 'KEEP',
      workspaces: {
        a: {
          '.npmrc': 'DELETE',
          '.eslintrc.json': 'DELETE',
          '.eslintrc.local.yml': 'KEEP',
        },
        b: {
          '.npmrc': 'DELETE',
          '.eslintrc.json': 'DELETE',
          '.eslintrc.local.yml': 'KEEP',
        },
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('with empty content', async (t) => {
  const s = await setup(t, { content: {} })
  await s.apply()
  t.strictSame(await s.readdirSource(), {
    'package.json': JSON.stringify({ name: 'testpkg' }, null, 2),
  })
})
