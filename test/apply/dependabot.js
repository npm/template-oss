const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

const allCases = {
  root: [{}, (t, { dependabot }) => {
    t.match(dependabot, 'directory: /')
    t.notMatch(dependabot, /directory: workspaces/)
  }],
  'root + workspaces': [{
    workspaces: { a: 'a', b: 'b', c: 'c' },
  }, (t, { dependabot }) => {
    t.match(dependabot, 'directory: /')
    t.match(dependabot, 'directory: workspaces/a/')
    t.match(dependabot, 'directory: workspaces/b/')
    t.match(dependabot, 'directory: workspaces/c/')
  }],
  'workspace only': [{
    package: {
      templateOSS: {
        rules: {
          '@npmcli/template-oss-rules/lib/rules/files': {
            options: {
              rootFiles: false,
            },
          },
        },
      },
    },
    workspaces: { a: 'a', b: 'b', c: 'c' },
  }, async (t, { dependabot }) => {
    t.notMatch(dependabot, /directory: \//)
    t.match(dependabot, 'directory: workspaces/a/')
    t.match(dependabot, 'directory: workspaces/b/')
    t.match(dependabot, 'directory: workspaces/c/')
  }],
}

const setupDependabot = async (t, config, assert) => {
  const s = await setup(t, {
    ok: true,
    ...config,
  })
  await s.apply()

  await assert(t, {
    ...s,
    dependabot: await s.readFile(join('.github', 'dependabot.yml')),
  })

  t.same(await s.check(), [])
  await s.apply()
  await s.apply()
  await s.apply()
  t.same(await s.check(), [])
}

t.test('basic', async t => {
  for (const [name, [config, assert]] of Object.entries(allCases)) {
    await t.test(name, t => setupDependabot(t, config, assert))
  }
})
