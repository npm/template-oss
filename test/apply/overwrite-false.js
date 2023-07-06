const t = require('tap')
const setup = require('../setup.js')

t.test('json merge', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        content: 'content',
      },
    },
    testdir: {
      content: {
        'index.js': `module.exports=${JSON.stringify({
          rootModule: {
            add: {
              'package.json': {
                file: 'more-package.json',
                overwrite: false,
              },
            },
          },
        })}`,
        'more-package.json': JSON.stringify({
          scripts: {
            test: 'tap test/',
          },
        }),
      },
    },
  })

  await s.apply()

  const pkg = await s.readJson('package.json')
  t.equal(pkg.scripts.test, 'tap test/')
  t.equal(pkg.scripts.snap, 'tap')

  t.strictSame(await s.check(), [])
})
