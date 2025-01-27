const t = require('tap')
const importOrRequire = require('../../lib/util/import-or-require.js')
const path = require('path')

t.test('importOrRequire', async t => {
  const dir = t.testdir({
    esm: {
      'package.json': JSON.stringify({
        type: 'module',
      }),
      'index.js': 'export default "type module";',
    },
    'esm.js': 'export default "esm";',
    'mjs.mjs': 'export default "mjs";',
    'cjs.cjs': 'module.exports = "cjs";',
    'js.js': 'module.exports = "js";',
    'invalid.js': 'invalid',
  })

  const typeModule = await importOrRequire(path.join(dir, 'esm/index.js'))
  t.same(typeModule, 'type module')

  const results = await importOrRequire(path.join(dir, 'esm.js'))
  t.same(results, {})

  await Promise.all(
    // double 'js' triggers the cache
    ['mjs', 'cjs', 'js', 'js'].map(async type => {
      const output = await importOrRequire(path.join(dir, `${type}.${type}`))
      t.same(output, type)
    }),
  )
})
