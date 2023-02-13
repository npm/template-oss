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
        rootRepo: false,
      },
    },
    workspaces: { a: 'a', b: 'b', c: 'c' },
  }, (t, { dependabot }) => {
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

// t.test('root', async (t) => {
//   const s = await setup(t, {
//     ok: true,
//     package: {
//       templateOSS: {
//         lockfile: true,
//       },
//     },
//   })
//   await s.apply()

//   const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

//   t.same(await s.check(), [])
//   await s.apply()
//   await s.apply()
//   await s.apply()
//   t.same(await s.check(), [])
// })

// t.test('root + workspaces', async (t) => {
//   const s = await setup(t, {
//     ok: true,
//     workspaces: { a: 'a', b: 'b', c: 'c' },
//     package: {
//       templateOSS: {
//         lockfile: true,
//       },
//     },
//   })
//   await s.apply()

//   const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

//   t.same(await s.check(), [])
//   await s.apply()
//   await s.apply()
//   await s.apply()
//   t.same(await s.check(), [])
// })

// t.test('workspaces only', async (t) => {
//   const s = await setup(t, {
//     ok: true,
//     package: {
//       templateOSS: {
//         rootRepo: false,
//         lockfile: true,
//       },
//     },
//     workspaces: { a: 'a', b: 'b', c: 'c' },
//   })
//   await s.apply()

//   const dependabot = await s.readFile(join('.github', 'dependabot.yml'))

//   t.same(await s.check(), [])
//   await s.apply()
//   await s.apply()
//   await s.apply()
//   t.same(await s.check(), [])
// })
