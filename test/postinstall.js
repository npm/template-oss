const { basename, dirname, join } = require('path')
const fs = require('@npmcli/fs')
const spawk = require('spawk')
const t = require('tap')

const copyContents = require('../lib/content/index.js')
const installPackages = require('../lib/install.js')
const patchPackage = require('../lib/package.js')

spawk.preventUnmatched()

t.test('when npm_package_json is unset logs stack and sets exitCode', async (t) => {
  // this is set by virtue of running tests with npm, save it and remove it
  const _env = process.env.npm_package_json
  delete process.env.npm_package_json

  const _error = console.error
  const logs = []
  console.error = (...args) => {
    logs.push(...args)
  }

  t.teardown(() => {
    process.env.npm_package_json = _env
    console.error = _error
    process.exitCode = undefined // yes, really
  })

  // t.mock instead of require so the cache doesn't interfere
  await t.mock('../bin/postinstall.js')
  t.match(logs[0], /must be run/, 'logged the error')
  t.equal(process.exitCode, 1, 'set process.exitCode')
})

t.test('sets up a new project', async (t) => {
  const pkg = {
    name: '@npmcli/foo-test',
    version: '1.0.0',
  }

  const root = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  const _env = process.env.npm_package_json
  process.env.npm_package_json = join(root, 'package.json')

  t.teardown(() => {
    process.env.npm_package_json = _env
  })

  const uninstall = spawk.spawn('npm', (args) => {
    return args[0] === 'uninstall' &&
      installPackages.removeDeps.every((dep) => args.includes(dep))
  }, { cwd: root })

  const install = spawk.spawn('npm', (args) => {
    return args[0] === 'install' &&
      args[1] === '--save-dev' &&
      installPackages.devDeps.every((dep) => args.includes(dep))
  }, { cwd: root })

  // t.mock instead of require so the cache doesn't interfere
  await t.mock('../bin/postinstall.js')

  // we mock the npm commands so this test doesn't take forever
  t.ok(uninstall.called, 'ran uninstalls')
  t.ok(install.called, 'ran installs')

  // verify file contents were copied
  const contents = await fs.readdir(root)
  for (const file in copyContents.content) {
    // if dirname is '.' we have a file
    if (dirname(file) === '.') {
      t.ok(contents.includes(file), `copied ${file}`)
    } else {
      const dir = join(root, dirname(file))
      const dirContents = await fs.readdir(dir)
      t.ok(dirContents.includes(basename(file)), `copied ${file}`)
    }
  }

  const pkgPath = join(root, 'package.json')
  const pkgContents = await fs.readFile(pkgPath, { encoding: 'utf8' })
  t.match(JSON.parse(pkgContents), patchPackage.changes, 'modified package.json')
})
