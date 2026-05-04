const t = require('tap')
const setup = require('../setup.js')

t.test('node:test runner', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        testRunner: 'node:test',
      },
    },
  })

  await s.apply()
  const pkg = await s.readJson('package.json')

  // Verify test scripts are for node:test
  t.equal(pkg.scripts.test, "node --test './test/**/*.js'")
  t.equal(
    pkg.scripts['test:cover'],
    "node --test --experimental-test-coverage --test-timeout=3000 --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 './test/**/*.js'",
  )
  t.equal(pkg.scripts.snap, "node --test --test-update-snapshots './test/**/*.js'")

  // Verify tap section is removed
  t.notOk(pkg.tap, 'tap section should not be present')

  // Verify nyc section is removed
  t.notOk(pkg.nyc, 'nyc section should not be present')

  // Verify tap is not in required dependencies
  const checks = await s.check()
  const requiredCheck = checks.find(c => c.title?.includes('required'))
  if (requiredCheck) {
    t.notMatch(requiredCheck.body || [], /tap/, 'tap should not be in required packages')
  }
})

t.test('node:test runner with incomplete coverage', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        testRunner: 'node:test',
        coverageThreshold: 0,
      },
    },
  })

  await s.apply()
  const pkg = await s.readJson('package.json')

  // Verify test scripts are for node:test
  t.equal(pkg.scripts.test, "node --test './test/**/*.js'")
  t.equal(
    pkg.scripts['test:cover'],
    "node --test --experimental-test-coverage --test-timeout=3000 './test/**/*.js'",
    'test:cover should not include coverage thresholds when coverageThreshold is 0',
  )
  t.equal(pkg.scripts.snap, "node --test --test-update-snapshots './test/**/*.js'")
})

t.test('tap runner (default)', async t => {
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

  // Verify test scripts are for tap
  t.equal(pkg.scripts.test, 'tap')
  t.equal(pkg.scripts.snap, 'tap')
  t.notOk(pkg.scripts['test:cover'], 'test:cover should not exist for tap')

  // Verify tap section is present
  t.ok(pkg.tap, 'tap section should be present')
})
