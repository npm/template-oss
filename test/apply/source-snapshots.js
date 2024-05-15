const t = require('tap')
const setup = require('../setup.js')

t.cleanSnapshot = setup.clean
t.formatSnapshot = setup.format.readdirSource

t.test('root only', async t => {
  const s = await setup(t)
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('with workspaces', async t => {
  const s = await setup(t, {
    workspaces: { a: 'a', b: 'b' },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('workspaces only', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        rootRepo: false,
        rootModule: false,
      },
    },
    workspaces: { a: 'a', b: 'b' },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('with content path', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
        defaultContent: false,
      },
    },
    testdir: {
      content_dir: {
        'index.js': 'module.exports={}',
      },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})

t.test('workspaces with nested content path', async t => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content_dir',
        defaultContent: false,
      },
    },
    workspaces: {
      a: {
        templateOSS: {
          content: '../../content_dir2',
        },
      },
    },
    testdir: {
      content_dir: { 'index.js': 'module.exports={}' },
      content_dir2: { 'index.js': 'module.exports={}' },
    },
  })
  await s.apply()
  await t.resolveMatchSnapshot(s.readdirSource())
})
