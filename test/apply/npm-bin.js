const t = require('tap')
const { join } = require('path')
const setup = require('../setup.js')

t.test('custom npm path', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        npm: '/path/to/npm',
      },
    },
  })
  await s.apply()
  const { scripts } = await s.readJson('package.json')
  t.equal(scripts.posttest, 'node /path/to/npm run lint')
})

t.test('relative npm bin with workspaces', async (t) => {
  const s = await setup(t, {
    ok: true,
    package: {
      templateOSS: {
        content: 'rootContent',
      },
    },
    workspaces: {
      a: 'a',
      b: { name: 'b', templateOSS: { npm: './local-workspace-cli.js' } },
      c: { name: 'c', templateOSS: { npm: 'npm' } },
      d: { name: 'd', templateOSS: { content: '../../wsContent' } },
      e: { name: 'e', templateOSS: { content: '../../wsContent', npm: 'npm' } },
    },
    testdir: {
      rootContent: { 'index.js': 'module.exports={ npm: "./cli.js" }' },
      wsContent: { 'index.js': 'module.exports={ npm: "../../cli.js" }' },
    },
  })
  await s.apply()

  const readScripts = (p) => s.readJson(join(p, 'package.json')).then(r => r.scripts)

  const ws = s.workspaces
  const pkgs = ['', ws.a, ws.b, ws.c, ws.d, ws.e]
  const [root, a, b, c, d, e] = await Promise.all(pkgs.map(readScripts))

  t.equal(root.posttest, 'node ./cli.js run lint')
  t.equal(a.posttest, 'node ../../cli.js run lint')
  t.equal(b.posttest, 'node ./local-workspace-cli.js run lint')
  t.equal(c.posttest, 'npm run lint')
  t.equal(d.posttest, 'node ../../cli.js run lint')
  t.equal(e.posttest, 'npm run lint')
})
