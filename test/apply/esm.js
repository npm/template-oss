const t = require('tap')
const setup = require('../setup.js')

t.test('basic', async (t) => {
  const s = await setup(t, {
    package: {
      type: 'module',
      templateOSS: {
        content: 'content_dir',
      },
    },
    testdir: {
      content_dir: {
        'file.js': 'var x = 1;',
        'index.js': 'export default { rootRepo:{add:{"file.js":"file.js"}} }',
      },
    },
  })
  await s.apply()

  const file = await s.readFile('file.js')
  t.match(file, 'var x = 1;')
})
