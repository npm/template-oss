const t = require('tap')
const setup = require('../setup.js')

t.test('can disable eslint', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        eslint: false,
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  delete pkg.templateOSS // templateOSS config has eslint in it
  t.notMatch(JSON.stringify(pkg), 'eslint')

  const gitignore = await s.readFile('.gitignore')
  t.notMatch(gitignore, 'eslint')

  const checks = await s.check()
  t.equal(checks.length, 1)
  t.notMatch(checks[0].solution, 'eslint')
})

t.test('can enable prettier', async t => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        prettier: true,
      },
    },
  })
  await s.apply()

  const pkg = await s.readJson('package.json')
  t.ok(pkg.scripts.prettier)
  t.match(pkg.scripts.lint, 'npm run prettier')
  t.match(pkg.scripts.lintfix, 'npm run prettier')

  const checks = await s.check()
  t.equal(checks.length, 1)
  t.match(checks[0].body, ['prettier', 'eslint-config-prettier', '@github/prettier-config'])

  await s.writeJson('package.json', {
    ...pkg,
    devDependencies: {
      ...pkg.devDependencies,
      prettier: '^3.0.0',
      'eslint-config-prettier': '^9.0.0',
      '@github/prettier-config': '0.0.6',
    },
  })

  t.strictSame(await s.check(), [])
})
