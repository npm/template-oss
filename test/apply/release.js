const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('no workspace flags in commands', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        publish: true,
      },
    },
  })
  await s.apply()

  const ciRelease = await s.readFile(join('.github', 'workflows', 'ci-release.yml'))

  t.match(ciRelease, '--ignore-scripts\n')
  t.notMatch(ciRelease, '--ignore-scripts --workspaces --include-workspace-root --if-present\n')

  const release = await s.readFile(join('.github', 'workflows', 'release.yml'))
  t.match(release, '--publish')
  t.match(release, '--backport=""')
})

t.test('uses workspace flags in commands', async t => {
  const s = await setup(t, {
    workspaces: {
      a: 'a',
    },
  })
  await s.apply()

  const ciRelease = await s.readFile(join('.github', 'workflows', 'ci-release.yml'))

  t.notMatch(ciRelease, '--ignore-scripts\n')
  t.match(ciRelease, '--ignore-scripts --workspaces --include-workspace-root --if-present\n')
})

t.test('backport', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        backport: 8,
        publish: true,
      },
    },
  })
  await s.apply()

  const ciRelease = await s.readFile(join('.github', 'workflows', 'ci-release.yml'))

  t.match(ciRelease, 'default: release/v8\n')

  const release = await s.readFile(join('.github', 'workflows', 'release.yml'))
  t.match(release, '--publish')
  t.match(release, '--backport="8"')
})
