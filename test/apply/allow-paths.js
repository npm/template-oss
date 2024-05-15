const t = require('tap')
const setup = require('../setup.js')

t.test('allow paths are merged', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        allowPaths: ['/a', '/b'],
      },
    },
  })
  await s.apply()

  const ignore = await s.readFile('.gitignore')
  t.ok(ignore.includes('!/a'))
  t.ok(ignore.includes('!/b'))
  t.ok(ignore.includes('!/lib/'))
})

t.test('works with custom content', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
        defaultContent: false,
        allowPaths: ['/a', '/b'],
      },
    },
    testdir: {
      content_dir: {
        'paths-json.hbs': '{{{json allowPaths}}}',
        'index.js': 'module.exports={rootRepo:{add:{"paths.json":"paths-json.hbs"}}}',
      },
    },
  })
  await s.apply()

  const paths = await s.readJson('paths.json')
  t.equal(paths[0], '/a')
  t.equal(paths[1], '/b')
})
