const { resolve } = require('path')
const t = require('tap')

t.test('resolved to content index', () => {
  const path = require.resolve('..')
  t.equal(path, resolve('lib/index.js'))
  t.ok(require(path))
})