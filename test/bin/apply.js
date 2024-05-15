const t = require('tap')

const templateApply = mocks =>
  t.mock(
    '../../bin/apply.js',
    mocks && {
      '../../lib/apply/index.js': async () => mocks(),
    },
  )

const _console = console
const _global = process.env.npm_config_global
const _prefix = process.env.npm_config_local_prefix
const errors = []

t.beforeEach(() => {
  delete process.env.npm_config_global
  delete process.env.npm_config_local_prefix
  console.error = (...args) => errors.push(...args)
  console.log = () => {
    throw 'nolog'
  }
})

t.afterEach(() => {
  process.env.npm_config_global = _global
  process.env.npm_config_local_prefix = _prefix
  global.console = _console
  if (process.exitCode) {
    process.exitCode = 0
  }
})

t.test('when npm_config_local_prefix is unset, does nothing', async t => {
  await templateApply()
  t.notOk(process.exitCode, 'exitCode is unset')
})

t.test('when npm_config_global is true, does nothing', async t => {
  process.env.npm_config_global = 'true'

  await templateApply()
  t.notOk(process.exitCode, 'exitCode is unset')
})

t.test('with mocks', async t => {
  process.env.npm_config_local_prefix = 'heynow'

  await templateApply(() => {})
  t.notOk(process.exitCode, 'exitCode is unset')
})

t.test('error', async t => {
  process.env.npm_config_local_prefix = 'heynow'

  await templateApply(() => {
    throw new Error('apply')
  })
  t.ok(process.exitCode, 'exitCode is unset')
})
