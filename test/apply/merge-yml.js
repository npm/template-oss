const t = require('tap')
const { join } = require('path')
const yaml = require('yaml')
const setup = require('../setup.js')

const toYml = (data) => new yaml.Document(data).toString()

t.test('json merge', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      'target.yml': toYml({
        existing: 'header',
        key: [
          { id: 1, a: 1 },
          { id: 2, a: 2 },
          { noid: 1 },
        ],
      }),
      content: {
        'index.js': await setup.fixture('yml-merge.js'),
        'source.yml': toYml({
          new: 'header',
          key: [
            { id: 1, b: 1 },
            { id: 2, b: 2 },
            { id: 3, b: 3 },
          ],
        }),
      },
    },
  })

  await s.apply()

  t.strictSame(yaml.parse(await s.readFile('target.yml')), {
    existing: 'header',
    key: [
      { id: 1, b: 1 },
      { id: 2, b: 2 },
      { noid: 1 },
      { id: 3, b: 3 },
    ],
  })
})

t.test('dependabot', async t => {
  t.test('root', async (t) => {
    const s = await setup(t, {
      ok: true,
    })
    await s.apply()

    const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

    t.match(dependabot, 'directory: /')
    t.notMatch(dependabot, /directory: workspaces/)

    t.same(await s.check(), [])
    await s.apply()
    await s.apply()
    await s.apply()
    t.same(await s.check(), [])
  })

  t.test('root + workspaces', async (t) => {
    const s = await setup(t, {
      ok: true,
      workspaces: { a: 'a', b: 'b', c: 'c' },
    })
    await s.apply()

    const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

    t.match(dependabot, 'directory: /')
    t.match(dependabot, 'directory: workspaces/a/')
    t.match(dependabot, 'directory: workspaces/b/')
    t.match(dependabot, 'directory: workspaces/c/')

    t.same(await s.check(), [])
    await s.apply()
    await s.apply()
    await s.apply()
    t.same(await s.check(), [])
  })

  t.test('workspaces only', async (t) => {
    const s = await setup(t, {
      ok: true,
      package: {
        templateOSS: {
          rootRepo: false,
        },
      },
      workspaces: { a: 'a', b: 'b', c: 'c' },
    })
    await s.apply()

    const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

    t.notMatch(dependabot, /directory: \//)
    t.match(dependabot, 'directory: workspaces/a/')
    t.match(dependabot, 'directory: workspaces/b/')
    t.match(dependabot, 'directory: workspaces/c/')

    t.same(await s.check(), [])
    await s.apply()
    await s.apply()
    await s.apply()
    t.same(await s.check(), [])
  })
})
