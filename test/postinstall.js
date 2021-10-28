const { basename, dirname, join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const TEMPLATE_VERSION = require('../package.json').version

const copyContents = require('../lib/content/index.js')
const patchPackage = require('../lib/package.js')

// t.mock instead of require so the cache doesn't interfere
const postinstall = () => t.mock('../bin/postinstall.js')

let _global, _prefix

t.beforeEach(() => {
  _global = process.env.npm_config_global
  _prefix = process.env.npm_config_local_prefix
})

t.afterEach(() => {
  process.env.npm_config_global = _global
  process.env.npm_config_local_prefix = _prefix
})

t.test('when npm_config_global is true, does nothing', async (t) => {
  process.env.npm_config_global = 'true'

  await postinstall()
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

t.test('when npm_config_local_prefix is unset, does nothing', async (t) => {
  delete process.env.npm_config_local_prefix

  await postinstall()
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

t.test('when patchPackage returns false no further action is taken', async (t) => {
  const pkg = {
    name: '@npmcli/foo-test',
    templateVersion: TEMPLATE_VERSION,
  }

  const root = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  process.env.npm_config_local_prefix = root

  await postinstall()
  // not setting process.exitCode tells us that the postinstall script
  // finished successfully since it would be set if it failed
  t.equal(process.exitCode, undefined, 'did not set process.exitCode')
})

t.test('sets up a new project', async (t) => {
  const pkg = {
    name: '@npmcli/foo-test',
    version: '1.0.0',
  }
  const root = t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  })

  process.env.npm_config_local_prefix = root

  await postinstall()

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
