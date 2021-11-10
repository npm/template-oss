const t = require('tap')

// t.mock instead of require so the cache doesn't interfere
const check = (mocks) => t.mock('../../bin/npm-template-check.js', mocks && {
  '../../lib/postlint/check-package.js': async () => mocks.package(),
  '../../lib/postlint/check-gitignore.js': async () => mocks.gitignore(),
})

const _console = console
const _prefix = process.env.npm_config_local_prefix
let errors = []
let logs = []

t.beforeEach(() => {
  delete process.env.npm_config_local_prefix
  // eslint-disable-next-line no-global-assign
  console = {
    ..._console,
    error: (...args) => errors.push(...args),
    log: (...args) => logs.push(...args),
  }
})

t.afterEach(() => {
  process.env.npm_config_local_prefix = _prefix
  errors = []
  logs = []
  global.console = _console
  delete process.exitCode
})

t.test('no local prefix', async (t) => {
  await check()

  t.equal(process.exitCode, 1, 'exit code')
  t.strictSame(logs, [], 'logs')
  t.match(errors, ['Error: This package requires npm'], 'errors')
  t.equal(errors.length, 1)
})

// We have 100% coverage via the coverage map
// so this is only for how the bin script formats
// error logs
t.test('with mocks', (t) => {
  t.plan(2)

  t.test('problems', async (t) => {
    process.env.npm_config_local_prefix = t.testdir()

    await check({
      package: () => [{
        message: 'message1',
        solution: 'solution1',
      }],
      gitignore: () => [{
        message: 'message2',
        solution: 'solution2',
      }],
    })

    t.equal(process.exitCode, 1, 'exit code')
    t.strictSame(logs, [], 'logs')
    t.strictSame(errors, [
      'Some problems were detected:',
      'message1\nmessage2',
      'To correct them:',
      'solution1\nsolution2',
    ], 'errors')
  })

  t.test('no problems', async (t) => {
    process.env.npm_config_local_prefix = t.testdir()

    await check({
      package: () => [],
      gitignore: () => [],
    })

    t.equal(process.exitCode, undefined, 'exit code')
    t.strictSame(logs, [], 'logs')
    t.strictSame(errors, [], 'errors')
  })
})
