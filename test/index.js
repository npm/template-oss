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
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
        defaultContent: false,
      },
    },
    testdir: {
      content_dir: { 'index.js': 'module.exports={}' },
    },
  })
  t.same(await s.runAll(), [])
})
