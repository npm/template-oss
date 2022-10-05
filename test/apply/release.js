const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('no workspace flags in commands', async (t) => {
  const s = await setup(t)
  await s.apply()

  const release = await s.readFile(join('.github', 'workflows', 'release.yml'))

  t.match(release, '--ignore-scripts --if-present\n')
  t.notMatch(release, '--ignore-scripts -ws -iwr --if-present\n')
})

t.test('uses workspace flags in commands', async (t) => {
  const s = await setup(t, {
    workspaces: {
      a: 'a',
    },
  })
  await s.apply()

  const release = await s.readFile(join('.github', 'workflows', 'release.yml'))

  t.notMatch(release, '--ignore-scripts --if-present\n')
  t.match(release, '--ignore-scripts -ws -iwr --if-present\n')
})
