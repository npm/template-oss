const t = require('tap')
const setup = require('../setup.js')

t.test('lockfile', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        lockfile: true,
      },
    },
  })
  await s.apply()
  const gitignore = await s.readFile('.gitignore')
  t.ok(gitignore.includes('package-lock.json'))

  const npmrc = await s.readFile('.npmrc')
  t.ok(npmrc.includes('package-lock=true'))
})

t.test('no lockfile by default', async (t) => {
  const s = await setup(t)
  await s.apply()
  const gitignore = await s.readFile('.gitignore')
  t.ok(!gitignore.includes('package-lock.json'))

  const npmrc = await s.readFile('.npmrc')
  t.ok(npmrc.includes('package-lock=false'))
})
