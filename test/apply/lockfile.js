const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = (obj) => setup.format.readdirSource({
  '.gitignore': obj['.gitignore'],
  '.npmrc': obj['.npmrc'],
})

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

  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('no lockfile by default', async (t) => {
  const s = await setup(t)
  await s.apply()
  const gitignore = await s.readFile('.gitignore')
  t.ok(!gitignore.includes('package-lock.json'))

  const npmrc = await s.readFile('.npmrc')
  t.ok(npmrc.includes('package-lock=false'))

  await t.resolveMatchSnapshot(s.readdirSource())
})
