const t = require('tap')
const { resolve } = require('path')
const check = require('../../lib/check/index.js')

t.test('this repo passes all checks', async (t) => {
  const root = resolve(__dirname, '..', '..')
  const res = await check(root, resolve(root, 'lib', 'content'))
  t.equal(res.length, 0)
})
