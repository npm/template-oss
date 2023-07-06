const t = require('tap')
const setup = require('../setup.js')

t.test('default dependabot', async (t) => {
  const s = await setup(t)
  await s.apply()

  const dependabot = await s.readFile('.github/dependabot.yml')
  const postDependabot = await s.stat('.github/workflows/post-dependabot.yml')

  t.match(dependabot, 'increase-if-necessary')
  t.ok(postDependabot)
})

t.test('no dependabot', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        dependabot: false,
      },
    },
  })
  await s.apply()

  const dependabot = await s.stat('.github/dependabot.yml').catch(() => false)
  const postDependabot = await s.stat('.github/workflows/post-dependabot.yml').catch(() => false)

  t.equal(dependabot, false)
  t.equal(postDependabot, false)
})
