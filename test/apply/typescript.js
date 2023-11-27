const t = require('tap')
const setup = require('../setup.js')

t.test('basic', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        typescript: true,
      },
    },
    testdir: {
      '.eslintrc.js': 'delete this',
      '.commitlintrc.js': 'delete this',
    },
  })

  t.ok(await s.exists('.eslintrc.js'))
  t.ok(await s.exists('.commitlintrc.js'))

  await s.apply()
  const checks = await s.check()
  const pkg = await s.readJson('package.json')
  const eslint = await s.readFile('.eslintrc.cjs')

  t.strictSame(checks[0].body, ['typescript', 'tshy', '@typescript-eslint/parser'])
  t.equal(pkg.scripts.prepare, 'tshy')
  t.equal(pkg.type, 'module')
  t.match(eslint, 'dist/')
  t.match(eslint, '@typescript-eslint/parser')
  t.notOk(await s.exists('.eslintrc.js'))
  t.notOk(await s.exists('.commitlintrc.js'))
  t.ok(await s.exists('.commitlintrc.cjs'))
})

t.test('no default content', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        typescript: true,
        defaultContent: false,
        content: 'content_dir',
      },
    },
    testdir: {
      content_dir: {
        'file.js': 'var x = 1;',
        'index.js': 'module.exports={rootModule:{add:{"file.js":"file.js"}}}',
      },
    },
  })
  await s.apply()
  const checks = await s.check()

  t.strictSame(checks[0].body, ['typescript', 'tshy', '@typescript-eslint/parser'])
})

t.test('with tap 16', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      devDependencies: {
        tap: '^16',
      },
      templateOSS: {
        typescript: true,
      },
    },
  })
  await s.apply()
  const checks = await s.check()
  const pkg = await s.readJson('package.json')

  t.equal(pkg.scripts.test, 'c8 tap')
  t.equal(pkg.scripts.snap, 'c8 tap')
  t.strictSame(pkg.tap['node-arg'], ['--no-warnings', '--loader', 'ts-node/esm'])
  t.strictSame(checks[0].body, ['typescript', 'tshy', '@typescript-eslint/parser', 'c8', 'ts-node'])
})
