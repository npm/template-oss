const t = require('tap')
const setup = require('../setup.js')

t.test('allow paths are merged', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        data: {
          values: {
            allowPaths: [
              '/a',
              '/b',
            ],
          },
        },
      },
    },
  })
  await s.apply()

  const ignore = await s.readFile('.gitignore')
  t.ok(ignore.includes('!/a'))
  t.ok(ignore.includes('!/b'))
  t.ok(ignore.includes('/*'))
  t.ok(ignore.includes('!**/.gitignore'))
})

t.test('works with custom content', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        extends: ['./content_dir', null],
        data: {
          values: {
            allowPaths: [
              '/a',
              '/b',
            ],
          },
        },
      },
    },
    testdir: {
      content_dir: {
        'paths.json': '{"paths": {$ allowPaths | dump $} }',
        'index.js': `module.exports = {
          rules: {
            '@npmcli/template-oss-rules/lib/rules/files': {
              options: {
                files: {
                  add: {
                    'paths.json': 'paths.json'
                  }
                }
              },
            },
          }
        }`,
      },
    },
  })
  await s.apply()

  const { paths } = await s.readJson('paths.json')
  t.strictSame(paths, ['/a', '/b'])
})
