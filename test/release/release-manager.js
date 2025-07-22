const t = require('tap')
const { execSync } = require('child_process')
const ReleaseManager = require('../../lib/release/release-manager.js')
const { releaseManager } = require('../fixtures/mock-release.js')

t.test('init', async t => {
  t.rejects(ReleaseManager.run())
  t.rejects(ReleaseManager.run({}))
  t.rejects(ReleaseManager.run({ token: 'ok' }))
  t.rejects(ReleaseManager.run({ token: 'ok', repo: 'ok' }))
  t.doesNotThrow(
    () =>
      new ReleaseManager({
        token: 'ok',
        repo: 'ok',
        pr: 'ok',
        silent: false,
        defaultTag: 'latest',
      }),
  )
})

t.test('mock release manager', async t => {
  const res = await releaseManager(t, { pr: 207 })
  t.matchSnapshot(res)
})

t.test('npm/cli', async t => {
  const res = await releaseManager(t, { pr: 7009, repo: 'npm/cli' })
  t.matchSnapshot(res)
})

t.test('prerelease', async t => {
  const res = await releaseManager(t, { pr: 6673, repo: 'npm/cli' })
  t.matchSnapshot(res)
})

t.test('publish and lockfile', async t => {
  const res = await releaseManager(t, {
    pr: 586,
    repo: 'npm/node-semver',
    publish: true,
    lockfile: true,
    backport: 7,
  })
  t.matchSnapshot(res)
})

t.test('single release', async t => {
  const res = await releaseManager(t, { pr: 586, repo: 'npm/node-semver' })
  t.matchSnapshot(res)
})

t.test('repo doesnt exist', async t => {
  t.rejects(releaseManager(t, { pr: 7009, repo: 'npm/cliiiiiiiii' }))
})

t.test('workspace names', async t => {
  const cwd = t.testdir()
  execSync('npm init -y', { cwd })
  execSync('npm init -y --workspace ws1', { cwd })
  execSync('npm pkg set name="@npmcli/arborist" --workspace ws1', { cwd })
  execSync('npm init -y --workspace libnpmdiff', { cwd })
  t.resolveMatchSnapshot(releaseManager(t, { cwd, pr: 6923, repo: 'npm/cli' }))
})

t.test('wiki 500 error', async t => {
  await t.rejects(releaseManager(t, { pr: 1, repo: 'test/repo' }), /Release process fetch failed with status: 500/)
})

t.test('prerelease filtering', async t => {
  const result = await releaseManager(t, { pr: 207 })
  t.matchSnapshot(result)
})

t.test('wiki with headers', async t => {
  const result = await releaseManager(t, { pr: 207 })
  t.matchSnapshot(result)
})
