const t = require('tap')
const { join } = require('path')
const yaml = require('yaml')
const setup = require('../setup.js')

const getCiJobs = async s => {
  const file = await s.readFile(join('.github', 'workflows', 'ci.yml'))
  const { jobs } = yaml.parse(file)
  return {
    lint: jobs.lint.steps[2].with['node-version'],
    test: jobs.test.strategy.matrix['node-version'],
  }
}

t.test('sets ci versions from engines', async t => {
  const s = await setup(t, {
    package: {
      engines: { node: '>=10' },
      templateOSS: {
        ciVersions: {
          '12.x': false,
        },
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  t.equal(pkg.engines.node, '>=10')

  const versions = await getCiJobs(s)
  t.equal(versions.lint, '22.x')
  t.strictSame(versions.test, ['10.0.0', '10.x', '14.x', '16.x', '18.x', '20.x', '22.x'])
})

t.test('can set ci to latest plus other versions', async t => {
  const s = await setup(t, {
    package: {
      engines: { node: '*' },
      templateOSS: {
        ciVersions: ['6.x', '8.x', 'latest'],
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  t.equal(pkg.engines.node, '*')

  const versions = await getCiJobs(s)
  t.equal(versions.lint, '22.x')
  t.strictSame(versions.test, ['6.x', '8.x', '22.x'])
})

t.test('sort by major', async t => {
  const s = await setup(t, {
    package: {
      engines: { node: '*' },
      templateOSS: {
        latestCiVersion: null,
        ciVersions: ['7.x', '6.0.0', '6.x', '7.0.0', '8.x', '8.0.0'],
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  t.equal(pkg.engines.node, '*')

  const versions = await getCiJobs(s)
  t.equal(versions.lint, '8.x')
  t.strictSame(versions.test, ['6.0.0', '6.x', '7.0.0', '7.x', '8.0.0', '8.x'])
})

t.test('latest ci versions', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        ciVersions: 'latest',
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  t.equal(pkg.engines, undefined)

  const versions = await getCiJobs(s)
  t.equal(versions.lint, '22.x')
  t.strictSame(versions.test, ['22.x'])
})
