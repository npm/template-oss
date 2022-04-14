const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('custom node', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npmBin: 'node /path/to/npm',
      },
    },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  t.equal(scripts.posttest, 'node /path/to/npm run lint')
})

t.test('custom node', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npmBin: 'node /path/to/npm',
      },
    },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  t.equal(scripts.posttest, 'node /path/to/npm run lint')
})

t.test('relative npm bin with workspaces', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npmBin: 'cli.js',
      },
    },
    workspaces: { a: '@name/aaaa', b: 'bbb' },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  const { scripts: scriptsA } = await s.readJson(join(s.workspaces.a, 'package.json'))
  const { scripts: scriptsB } = await s.readJson(join(s.workspaces.b, 'package.json'))
  t.equal(scripts.posttest, 'node cli.js run lint')
  t.equal(scriptsA.posttest, 'node ../../cli.js run lint')
  t.equal(scriptsB.posttest, 'node ../../cli.js run lint')
})

t.test('npm bin workspaces only with root config', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
        npmBin: './cli.js',
      },
    },
    workspaces: { a: '@name/aaaa', b: 'bbb' },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  const { scripts: scriptsA } = await s.readJson(join(s.workspaces.a, 'package.json'))
  const { scripts: scriptsB } = await s.readJson(join(s.workspaces.b, 'package.json'))
  t.equal(scripts, undefined)
  t.equal(scriptsA.posttest, 'node ../../cli.js run lint')
  t.equal(scriptsB.posttest, 'node ../../cli.js run lint')
})

t.test('separate workspace configs', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
      },
    },
    workspaces: {
      a: {
        name: 'a',
        templateOSS: {
          npmBin: 'bin_a.js',
        },
      },
      b: {
        name: 'b',
        templateOSS: {
          npmBin: 'bin_b.js',
        },
      },
    },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  const { scripts: scriptsA } = await s.readJson(join(s.workspaces.a, 'package.json'))
  const { scripts: scriptsB } = await s.readJson(join(s.workspaces.b, 'package.json'))
  t.equal(scripts, undefined)
  t.equal(scriptsA.posttest, 'node bin_a.js run lint')
  t.equal(scriptsB.posttest, 'node bin_b.js run lint')
})
