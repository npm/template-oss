const t = require('tap')
const setup = require('../setup.js')

t.test('tap@18', async t => {
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
  t.strictSame(pkg.tap, {
    'show-full-coverage': true,
  })
})

t.test('tap@16', async t => {
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
    'nyc-arg': ['--exclude', 'tap-snapshots/**'],
  })
})

for (const version of ['^18', '^20.0.3', '^21']) {
  for (const checkCoverage of [true, false]) {
    t.test(`tap@${version} migrates check-coverage=${checkCoverage}`, async t => {
      const s = await setup(t, {
        ok: true,
        package: {
          devDependencies: {
            tap: version,
          },
          tap: {
            'check-coverage': checkCoverage,
            'coverage-map': 'map.js',
          },
        },
        testdir: {
          'map.js': 'module.exports = () => null\n',
        },
      })

      t.match(JSON.stringify(await s.check()), /check-coverage/)
      await s.apply()
      const pkg = await s.readJson('package.json')
      t.strictSame(pkg.tap, {
        'coverage-map': 'map.js',
        'show-full-coverage': true,
        ...(!checkCoverage && {
          'allow-incomplete-coverage': true,
          'allow-empty-coverage': true,
        }),
      })
      t.strictSame(pkg.nyc, { exclude: [] })
      t.strictSame(await s.check(), [])

      await s.apply()
      t.strictSame(await s.readJson('package.json'), pkg, 'applying again is idempotent')
    })
  }

  t.test(`tap@${version} coverage migration uses each workspace configuration`, async t => {
    const s = await setup(t, {
      ok: true,
      package: {
        devDependencies: {
          tap: version,
        },
        tap: {
          'check-coverage': true,
        },
      },
      workspaces: {
        legacy: {
          devDependencies: {
            tap: '^16',
          },
          tap: {
            'check-coverage': false,
          },
        },
        modern: {
          devDependencies: {
            tap: version,
          },
          tap: {
            'check-coverage': false,
            'coverage-map': 'map.js',
          },
        },
      },
    })

    for (const [name, tap] of [
      ['legacy', '^16'],
      ['modern', version],
    ]) {
      const path = `${s.workspaces[name]}/package.json`
      const pkg = await s.readJson(path)
      pkg.devDependencies.tap = tap
      await s.writeJson(path, pkg)
    }

    await s.apply()
    const root = await s.readJson('package.json')
    const legacy = await s.readJson(`${s.workspaces.legacy}/package.json`)
    const modern = await s.readJson(`${s.workspaces.modern}/package.json`)

    t.strictSame(root.tap, {
      exclude: ['workspaces/legacy/**', 'workspaces/modern/**'],
      'show-full-coverage': true,
    })
    t.strictSame(legacy.tap, {
      'check-coverage': false,
      'nyc-arg': ['--exclude', 'tap-snapshots/**'],
    })
    t.strictSame(modern.tap, {
      'coverage-map': 'map.js',
      'show-full-coverage': true,
      'allow-incomplete-coverage': true,
      'allow-empty-coverage': true,
    })
    t.strictSame(await s.check(), [])
  })
}

t.test('modern TAP preserves explicit coverage settings when migrating', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^20.0.3',
      },
      tap: {
        'check-coverage': false,
        'allow-incomplete-coverage': false,
        'allow-empty-coverage': false,
      },
    },
  })

  await s.apply()
  const pkg = await s.readJson('package.json')
  t.strictSame(pkg.tap, {
    'show-full-coverage': true,
    'allow-incomplete-coverage': false,
    'allow-empty-coverage': false,
  })
})

for (const checkCoverage of [true, false]) {
  t.test(`tap@16 preserves check-coverage=${checkCoverage}`, async t => {
    const s = await setup(t, {
      ok: true,
      package: {
        devDependencies: {
          tap: '^16',
        },
        tap: {
          'check-coverage': checkCoverage,
          'coverage-map': 'map.js',
        },
      },
    })

    await s.apply()
    const pkg = await s.readJson('package.json')
    t.strictSame(pkg.tap, {
      'check-coverage': checkCoverage,
      'coverage-map': 'map.js',
      'nyc-arg': ['--exclude', 'tap-snapshots/**'],
    })
  })
}
