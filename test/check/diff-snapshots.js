const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.checks

t.test('update and remove errors', async t => {
  const s = await setup(t, { ok: true })

  await s.apply()

  await s.unlink('.npmrc')

  const ciPath = join('.github', 'workflows', 'ci.yml')
  const ci = await s.readFile(ciPath)
  await s.writeFile(ciPath, ci.split('\n').slice(0, -21).join('\n'))

  await s.appendFile(join('.github', 'workflows', 'audit.yml'), '>>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<')

  await s.writeFile('.eslintrc.json', 'this has to be deleted')

  await t.resolveMatchSnapshot(s.check())
})

t.test('will diff json', async t => {
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

t.test('json overwrite', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      'target.json': JSON.stringify({ a: 1 }),
      content: {
        'source.json': JSON.stringify({ b: 1 }),
        'index.js': `module.exports={rootRepo:{add:{'target.json':'source.json'}}}`,
      },
    },
  })

  await t.resolveMatchSnapshot(s.check())
  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('json merge', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      'target.json': JSON.stringify({ a: 1 }),
      content: {
        'source.json': JSON.stringify({ b: 1 }),
        'index.js': await setup.fixture('json-merge.js'),
      },
    },
  })

  await t.resolveMatchSnapshot(s.check(), 'initial check')
  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('json delete', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      'target.json': JSON.stringify({ a: 1 }),
      content: {
        'source.json': JSON.stringify({ a: '__DELETE__', b: 2 }),
        'index.js': await setup.fixture('json-delete.js'),
      },
    },
  })

  await t.resolveMatchSnapshot(s.check())
  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('different headers', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      content: {
        'source.txt': 'source',
        'index.js': await setup.fixture('header.js'),
      },
    },
  })

  await t.resolveMatchSnapshot(s.check())
  await s.apply()
  t.strictSame(await s.check(), [])
})

t.test('unknown file type', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      content: {
        'source.txt': 'source',
        'index.js': `module.exports={rootRepo:{add:{'target.txt':'source.txt'}}}`,
      },
    },
  })

  await t.resolveMatchSnapshot(s.check())
  await s.apply()
  t.strictSame(await s.check(), [])
})
