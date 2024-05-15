const t = require('tap')
const setup = require('../setup.js')

t.test('json merge', async t => {
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
  t.strictSame(await s.check(), [])

  const pkg = await s.readJson('package.json')
  t.equal(pkg.scripts.test, 'tap test/')
  t.equal(pkg.scripts.snap, 'tap')

  await s.writeJson('package.json', {
    ...pkg,
    author: 'What?',
    scripts: {
      ...pkg.scripts,
      test: 'tap',
    },
    templateOSS: {
      ...pkg.templateOSS,
      version: '1.0.0',
    },
  })

  const checks = await s.check()
  t.equal(checks.length, 1)
  t.match(checks[0].title, 'package.json needs to be updated')
  t.match(checks[0].body[0], `"author" is "What?", expected "GitHub Inc."`)
  t.match(checks[0].body[0], `scripts.test" is "tap", expected "tap test/"`)

  await s.apply()
  t.strictSame(await s.check(), [])
})
