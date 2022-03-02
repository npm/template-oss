const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = (a) => Array.isArray(a)
  ? setup.format.checks(a)
  : setup.format.readdirSource(a)

t.test('update, remove, errors', async (t) => {
  const s = await setup(t, { ok: true })

  await s.apply()

  await s.unlink('.npmrc')

  const ciPath = join('.github', 'workflows', 'ci.yml')
  const ci = await s.readFile(ciPath)
  await s.writeFile(ciPath, ci.split('\n').slice(0, -21).join('\n'))

  await s.appendFile(
    join('.github', 'workflows', 'audit.yml'),
    '>>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<'
  )

  await s.writeFile('.eslintrc.json', 'this has to be deleted')

  await t.resolveMatchSnapshot(s.check())
})

t.test('workspaces', async (t) => {
  const s = await setup(t, {
    ok: true,
    workspaces: { a: 'a', b: 'b' },
  })

  await s.apply()

  await s.writeFile(join(s.workspaces.a, '.npmrc'), 'no workspace npmrc')
  await s.writeFile(join(s.workspaces.b, '.npmrc'), 'no workspace npmrc')

  await t.resolveMatchSnapshot(s.check())
})

t.test('will diff json', async (t) => {
  const s = await setup(t, { ok: true })
  await s.apply()

  const pkg = await s.readJson('package.json')
  pkg.author = 'heynow'
  pkg.files.pop()
  pkg.files.push('x')
  pkg.scripts.preversion = 'x'
  pkg.scripts['lint:fix'] = 'x'
  pkg.scripts.engines = { node: '15' }
  pkg.templateVersion = '1'
  pkg.standard = { config: 'x ' }
  await s.writeJson('package.json', pkg)

  await t.resolveMatchSnapshot(s.check())
})

t.test('json overwrite', async (t) => {
  const s = await setup(t, {
    testdir: {
      'target.json': JSON.stringify({ a: 1 }),
      content: {
        'source.json': JSON.stringify({ b: 1 }),
        'index.js': `module.exports={rootRepo:{add:{'target.json':'source.json'}}}`,
      },
    },
    content: 'content',
  })

  await t.resolveMatchSnapshot(s.check(), 'initial check')
  await s.apply()
  t.strictSame(await s.check(), [])
  await t.resolveMatchSnapshot(s.readdirSource(), 'source after apply')
})

t.test('json merge', async (t) => {
  const s = await setup(t, {
    testdir: {
      'target.json': JSON.stringify({ a: 1 }),
      content: {
        'source.json': JSON.stringify({ b: 1 }),
        'index.js': await setup.fixture('json-merge.js'),
      },
    },
    content: 'content',
  })

  await t.resolveMatchSnapshot(s.check(), 'initial check')
  await s.apply()
  t.strictSame(await s.check(), [])
  await t.resolveMatchSnapshot(s.readdirSource(), 'source after apply')
})

t.test('node 10', async (t) => {
  const s = await setup(t, { ok: true })
  await s.apply()

  t.strictSame(await s.check(), [])

  const pkg = await s.readJson('package.json')
  pkg.templateOSS.ciVersions = [...setup.content.ciVersions, '10']
  await s.writeJson('package.json', pkg)

  await s.apply()
  await t.resolveMatchSnapshot(s.check())
})

t.test('different headers', async (t) => {
  const s = await setup(t, {
    testdir: {
      content: {
        'source.txt': 'source',
        'index.js': await setup.fixture('header.js'),
      },
    },
    content: 'content',
  })

  await t.resolveMatchSnapshot(s.check(), 'initial check')
  await s.apply()
  t.strictSame(await s.check(), [])
  await t.resolveMatchSnapshot(s.readdirSource(), 'source after apply')
})

t.test('unknown file type', async (t) => {
  const s = await setup(t, {
    testdir: {
      content: {
        'source.txt': 'source',
        'index.js': `module.exports={rootRepo:{add:{'target.txt':'source.txt'}}}`,
      },
    },
    content: 'content',
  })

  await t.resolveMatchSnapshot(s.check(), 'initial check')
  await s.apply()
  t.strictSame(await s.check(), [])
  await t.resolveMatchSnapshot(s.readdirSource(), 'source after apply')
})
