const t = require('tap')
const setup = require('../setup.js')

t.test('tap@18', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^18',
      },
    },
  })

  await s.apply()
  const pkg = await s.readJson('package.json')
  t.strictSame(pkg.tap, {})
})

t.test('tap@16', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^16',
      },
    },
  })

  await s.apply()
  const pkg = await s.readJson('package.json')
  t.strictSame(pkg.tap, {
    'nyc-arg': [
      '--exclude',
      'tap-snapshots/**',
    ],
  })
})
