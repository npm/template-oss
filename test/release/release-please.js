const t = require('tap')
const fs = require('fs')
const { execSync } = require('child_process')
const ReleasePlease = require('../../lib/release/release-please.js')
const { releasePlease, setup, BRANCH, REPO_DIR } = require('../fixtures/mock-release.js')
const { join, resolve } = require('path')

t.test('init', async t => {
  await t.rejects(ReleasePlease.run())
  await t.rejects(ReleasePlease.run({}))
  await t.rejects(ReleasePlease.run({ token: 'ok' }))
  await t.rejects(ReleasePlease.run({ token: 'ok', repo: 'ok' }))
  await t.rejects(new ReleasePlease({
    token: 'ok',
    repo: 'ok',
    branch: 'ok',
    defaultTag: 'ok',
  }).init())
})

t.test('cases', async t => {
  const execRepo = (cmd, opts) =>
    execSync(cmd, { cwd: REPO_DIR, encoding: 'utf-8', ...opts }).trim()

  const updateJSON = (p, fn) => {
    const file = resolve(REPO_DIR, p)
    const data = fn(require(file))
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  }

  const matchPr = async (t, s, { flags, msg, prerelease }) => {
    if (s.record) {
      execRepo('git pull')
      execRepo(`git reset --hard origin/${BRANCH}`)
      updateJSON(join(REPO_DIR, 'release-please-config.json'), (d) => ({
        ...d,
        'last-release-sha': execRepo('git log --grep="chore: release" --format=format:%H -n1'),
        'release-search-depth': 7,
        'commit-search-depth': 1,
        'sequential-calls': true,
        'release-as': undefined,
        prerelease: prerelease ?? undefined,
      }))
      execRepo(`npm pkg set touch1=$RANDOM ${flags}`)
      execRepo('git add -A')
      execRepo(`git commit -m "${msg}"`)
      execRepo('git push')
    }
    const res = await releasePlease(t, { setup: s })
    t.ok(res.pr)
    t.notOk(res.releases)
    t.matchSnapshot(res.pr, `pr ${msg}`)
  }

  const matchReleases = async (t, s, { msg }) => {
    if (s.record) {
      const prList = execRepo(`gh pr list -l "autorelease: pending" -B "${BRANCH}" --json number`)
      const prNumber = JSON.parse(prList)[0].number
      execRepo(`gh pr merge ${prNumber} --squash`)
    }
    const res = await releasePlease(t, { setup: s })
    t.notOk(res.pr)
    t.ok(res.releases)
    t.matchSnapshot(res.releases, `releases ${msg}`)
  }

  await t.test('fix all', async t => {
    const s = setup(t)
    await matchPr(t, s, { flags: '-ws -iwr', msg: 'fix: update all packages' })
    await matchReleases(t, s, { msg: 'update all' })
  })

  await t.test('fix one', async t => {
    const s = setup(t)
    await matchPr(t, s, { flags: '-w @npmcli/pkg3', msg: 'fix: update pkg3' })
    await matchReleases(t, s, { msg: 'update pkg3' })
  })

  await t.test('prerelease', async t => {
    const s = setup(t)
    await matchPr(t, s, {
      flags: '-ws -iwr',
      msg: 'feat!: update all packages',
      prerelease: true,
    })
    await matchReleases(t, s, { msg: 'prerelease all' })
  })
})
