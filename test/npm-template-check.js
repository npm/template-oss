const t = require('tap')

const { changes } = require('../lib/package')

// t.mock instead of require so the cache doesn't interfere
const check = () => t.mock('../bin/npm-template-check.js')

let _console, _prefix, errors, logs

t.beforeEach(() => {
  _console = global.console
  _prefix = process.env.npm_config_local_prefix
  errors = []
  logs = []
  global.console = {
    ..._console,
    error: (...args) => errors.push(...args),
    logs: (...args) => logs.push(...args),
  }
})

t.afterEach(() => {
  global.console = _console
  process.env.npm_config_local_prefix = _prefix
  errors = []
  logs = []
  process.exitCode = 0
})

t.test('no local prefix', async (t) => {
  delete process.env.npm_config_local_prefix

  await check()

  t.equal(process.exitCode, 1, 'exit code')
  t.same(logs, [], 'logs')
  t.match(errors, ['Error: This package requires npm'], 'errors')
  t.equal(errors.length, 1)
})

t.test('empty package.json', async (t) => {
  const root = t.testdir({
    'package.json': '{}',
  })

  process.env.npm_config_local_prefix = root

  await check()

  t.equal(process.exitCode, 1, 'exit code')
  t.same(logs, [], 'logs')
  t.equal(errors.length, 4, 'errors')
})

t.test('valid package.json', async (t) => {
  const root = t.testdir({
    'package.json': JSON.stringify(changes),
  })

  process.env.npm_config_local_prefix = root

  await check()

  t.equal(process.exitCode, 0, 'exit code')
  t.same(logs, [], 'logs')
  t.same(errors, [], 'errors')
})
