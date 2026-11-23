const t = require('tap')
const { pathToFileURL } = require('node:url')
const yaml = require('yaml')
const setup = require('../setup.js')

t.test('disabled by default and independent of release backport configuration', async t => {
  for (const templateOSS of [{}, { backportAutomation: false }, { backport: 5 }]) {
    const s = await setup(t, { package: { templateOSS } })
    await s.apply()
    t.notOk(await s.exists('.github/workflows/backport.yml'))
    t.notOk(await s.exists('.github/scripts/backport.cjs'))
  }
})

t.test('opt-in generates a managed workflow and an ESM-compatible helper', async t => {
  const s = await setup(t, {
    package: { type: 'module', templateOSS: { backportAutomation: true } },
    workspaces: { a: 'a' },
  })
  await s.apply()
  const workflow = yaml.parse(await s.readFile('.github/workflows/backport.yml'))
  t.strictSame(workflow.on, { pull_request_target: { types: ['closed', 'labeled'] } })
  t.strictSame(workflow.permissions, {})
  t.strictSame(workflow.jobs.backport.permissions, {
    contents: 'write',
    'pull-requests': 'write',
    actions: 'write',
  })
  t.equal(workflow.concurrency['cancel-in-progress'], false)
  t.strictSame(workflow.jobs.backport.steps[0].with, {
    ref: '${{ github.event.repository.default_branch }}',
    'fetch-depth': 0,
  })
  t.match(workflow.jobs.backport.steps[1].with.script, "require('./.github/scripts/backport.cjs')")
  t.notMatch(JSON.stringify(workflow), /head\.ref|head\.sha|repository_owner|npm|workflow_dispatch/)
  const { default: backport } = await import(pathToFileURL(s.join('.github/scripts/backport.cjs')))
  t.type(backport, 'function')
  await backport({ context: { payload: {} } })
  await s.writeFile('.github/scripts/backport.cjs', 'overwritten')
  const pkg = await s.readJson('package.json')
  pkg.templateOSS.version = '0.0.0'
  await s.writeJson('package.json', pkg)
  await s.apply()
  t.match(await s.readFile('.github/scripts/backport.cjs'), 'module.exports = async')
  t.notOk(await s.exists('.github/workflows/backport-a.yml'), 'only the root manages backports')
  t.ok(yaml.parse(await s.readFile('.github/workflows/ci.yml')).on.workflow_dispatch !== undefined)
})

t.test('workspace opt-in does not enable privileged root automation', async t => {
  const s = await setup(t, {
    workspaces: { a: { templateOSS: { backportAutomation: true } } },
  })
  await s.apply()
  t.notOk(await s.exists('.github/workflows/backport.yml'))
  t.notOk(await s.exists('.github/scripts/backport.cjs'))
})
