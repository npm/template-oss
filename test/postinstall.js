const { basename, dirname, join, normalize } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')

const TEMPLATE_VERSION = require('../package.json').version

const copyContents = require('../lib/content/index.js')
const patchPackage = require('../lib/package.js')

t.test('when npm_config_global is true, does nothing', async (t) => {
  // this is set by virtue of running tests with npm, save it and remove it
  const _env = process.env.npm_config_global
  delete process.env.npm_config_global

  t.teardown(() => {
    process.env.npm_config_global = _env
  })

  // t.mock instead of require so the cache doesn't interfere
  await t.mock('../bin/postinstall.js')
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

t.test('when npm_config_local_prefix is unset, does nothing', async (t) => {
  // this is set by virtue of running tests with npm, save it and remove it
  const _env = process.env.npm_config_local_prefix
  delete process.env.npm_config_local_prefix

  t.teardown(() => {
    process.env.npm_config_local_prefix = _env
  })

  // t.mock instead of require so the cache doesn't interfere
  await t.mock('../bin/postinstall.js')
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

t.test('when patchPackage returns false no further action is taken', async (t) => {
  const pkg = {
    name: '@npmcli/foo-test',
    templateVersion: TEMPLATE_VERSION,
  }

  // normalize is necessary here until https://github.com/tapjs/libtap/pull/40
  // is shipped in a new release of tap, otherwise the spawk interceptors
  // below will not match and tests will fail in windows
  const root = normalize(t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  }))

  const _global = process.env.npm_config_global
  const _prefix = process.env.npm_config_local_prefix
  delete process.env.npm_config_global
  process.env.npm_config_local_prefix = root

  t.teardown(() => {
    process.env.npm_config_global = _global
    process.env.npm_config_local_prefix = _prefix
  })

  // t.mock instead of require so the cache doesn't interfere
  // this will reject if actions are taken due to spawk preventing unmatched
  // spawn calls
  await t.mock('../bin/postinstall.js')
  // not setting process.exitCode tells us that the postinstall script
  // finished successfully since it would be set if it failed
  t.equal(process.exitCode, undefined, 'did not set process.exitCode')
})

t.test('sets up a new project', async (t) => {
  const pkg = {
    name: '@npmcli/foo-test',
    version: '1.0.0',
  }

  // normalize is necessary here until https://github.com/tapjs/libtap/pull/40
  // is shipped in a new release of tap, otherwise the spawk interceptors
  // below will not match and tests will fail in windows
  const root = normalize(t.testdir({
    'package.json': JSON.stringify(pkg, null, 2),
  }))

  const _global = process.env.npm_config_global
  const _prefix = process.env.npm_config_local_prefix
  delete process.env.npm_config_global
  process.env.npm_config_local_prefix = root

  t.teardown(() => {
    process.env.npm_config_global = _global
    process.env.npm_config_local_prefix = _prefix
  })

  // t.mock instead of require so the cache doesn't interfere
  await t.mock('../bin/postinstall.js')

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
