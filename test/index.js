const t = require('tap')
const setup = require('./setup.js')

t.test('apply and check is ok', async (t) => {
  const s = await setup(t, { ok: true })
  t.same(await s.runAll(), [])
})

t.test('apply and check multiple is ok', async (t) => {
  const s = await setup(t, { ok: true })
  t.same(await s.runAll(), [])
  t.same(await s.runAll(), [])
})

t.test('empty content is ok', async (t) => {
  const s = await setup(t, { content: {} })
  t.same(await s.runAll(), [])
})

t.test('empty file objects', async (t) => {
  const s = await setup.git(t, {
    ok: true,
    workspaces: { a: 'a', b: 'b' },
    content: {
      rootRepo: {},
      rootModule: {},
      workspaceRepo: {},
      workspaceModule: {},
    },
  })
  t.same(await s.runAll(), [])
})
