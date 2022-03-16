const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.checks

t.test('check empty dir', async (t) => {
  const s = await setup(t)
  await t.resolveMatchSnapshot(s.check())
})

t.test('workspaces with empty dir', async (t) => {
  const s = await setup(t, {
    workspaces: { a: '@name/aaaa', b: 'bbb' },
  })
  await t.resolveMatchSnapshot(s.check())
})

t.test('with empty content', async (t) => {
  const s = await setup(t, { content: {} })
  t.same(await s.check(), [])
})
