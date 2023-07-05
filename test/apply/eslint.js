const t = require('tap')
const setup = require('../setup.js')

t.test('can disable eslint', async (t) => {
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
