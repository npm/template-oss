const t = require('tap')
const setup = require('../setup.js')

t.test('CI workflow with node:test does not include tap matcher', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        testRunner: 'node:test',
      },
    },
  })

  await s.apply()
  const ciWorkflow = await s.readFile('.github/workflows/ci.yml')

  // Verify tap matcher is not included
  t.notMatch(ciWorkflow, 'add-matcher', 'CI workflow should not include tap problem matcher')
  t.notMatch(ciWorkflow, 'tap.json', 'CI workflow should not reference tap.json')

  // Verify conditional test steps for coverage
  t.match(ciWorkflow, /Test \(with coverage on Node >= 24\)/, 'should have test with coverage step for Node >= 24')
  t.match(ciWorkflow, /Test \(without coverage on Node < 24\)/, 'should have test without coverage step for Node < 24')
  t.match(ciWorkflow, 'fromJSON(matrix.node-version) >= 24', 'should check if Node version >= 24')
  t.match(ciWorkflow, 'fromJSON(matrix.node-version) < 24', 'should check if Node version < 24')
  t.match(ciWorkflow, /test:cover/, 'should use test:cover script for Node >= 24')
})

t.test('CI workflow with tap includes tap matcher', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^18',
      },
    },
  })

  await s.apply()
  const ciWorkflow = await s.readFile('.github/workflows/ci.yml')

  // Verify tap matcher is included
  t.match(ciWorkflow, 'add-matcher', 'CI workflow should include tap problem matcher')
  t.match(ciWorkflow, 'tap.json', 'CI workflow should reference tap.json')
})

t.test('tap.json not created with node:test', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        testRunner: 'node:test',
      },
    },
  })

  await s.apply()
  const exists = await s.exists('.github/matchers/tap.json')

  t.notOk(exists, 'tap.json should not be created when using node:test')
})

t.test('tap.json created with tap', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^18',
      },
    },
  })

  await s.apply()
  const exists = await s.exists('.github/matchers/tap.json')

  t.ok(exists, 'tap.json should be created when using tap')
})
