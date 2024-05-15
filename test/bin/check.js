const t = require('tap')

const templateCheck = mocks =>
  t.mock(
    '../../bin/check.js',
    mocks && {
      '../../lib/check/index.js': async () => mocks(),
    },
  )

const _console = console
const _prefix = process.env.npm_config_local_prefix
const errors = []

t.beforeEach(() => {
  delete process.env.npm_config_local_prefix
  console.error = (...args) => errors.push(...args)
  console.log = () => {
    throw 'nolog'
  }
})

t.afterEach(() => {
  process.env.npm_config_local_prefix = _prefix
  errors.length = 0
  global.console = _console
  if (process.exitCode) {
    process.exitCode = 0
  }
})

t.test('no local prefix', async t => {
  await templateCheck()

  t.equal(process.exitCode, 1, 'exit code')
  t.match(errors, ['Error: This package requires npm'], 'errors')
  t.equal(errors.length, 1)
})

t.test('problems', async t => {
  process.env.npm_config_local_prefix = t.testdir()

  await templateCheck(() => [
    {
      title: 'message1',
      body: ['a', 'b'],
      solution: 'solution1',
    },
    {
      title: 'message2',
      body: ['c'],
      solution: 'solution2',
    },
  ])

  t.ok(process.exitCode, 'exit code')
  t.matchSnapshot(errors.join('\n'))
})

t.test('no problems', async t => {
  process.env.npm_config_local_prefix = t.testdir()

  await templateCheck(() => [])

  t.notOk(process.exitCode, 'exit code')
  t.strictSame(errors, [], 'errors')
})
