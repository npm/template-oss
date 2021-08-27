const spawk = require('spawk')
const t = require('tap')

const installPackages = require('../lib/install.js')

spawk.preventUnmatched()

t.test('installs packages', async (t) => {
  const pkg = {
    name: '@npmcli/test-foo',
    version: '1.0.0',
  }

  const root = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const removes = spawk.spawn('npm', (args) => {
    return args[0] === 'uninstall' &&
      installPackages.removeDeps.every((dep) => args.includes(dep))
  }, { cwd: root })

  const installs = spawk.spawn('npm', (args) => {
    return args[0] === 'install' &&
      args[1] === '--save-dev' &&
      installPackages.devDeps.every((dep) => args.includes(dep))
  }, { cwd: root })

  await installPackages(root)
  t.ok(removes.called, 'uninstalled packages')
  t.ok(installs.called, 'installed packages')
})
