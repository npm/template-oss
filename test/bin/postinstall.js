const t = require('tap')

// t.mock instead of require so the cache doesn't interfere
const postinstall = (mocks) => t.mock('../../bin/postinstall.js', mocks && {
  '../../lib/postinstall/update-package.js': async () => mocks.package(),
  '../../lib/postinstall/copy-content.js': async () => mocks.content(),
})

const _global = process.env.npm_config_global
const _prefix = process.env.npm_config_local_prefix
const _console = console
let errors = []
let logs = []

t.beforeEach(() => {
  delete process.env.npm_config_global
  delete process.env.npm_config_local_prefix
  // eslint-disable-next-line no-global-assign
  console = {
    ..._console,
    error: (...args) => errors.push(...args),
    logs: (...args) => logs.push(...args),
  }
})

t.afterEach(() => {
  process.env.npm_config_global = _global
  process.env.npm_config_local_prefix = _prefix
  errors = []
  logs = []
  global.console = _console
  delete process.exitCode
})

t.test('when npm_config_local_prefix is unset, does nothing', async (t) => {
  await postinstall()
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

t.test('when npm_config_global is true, does nothing', async (t) => {
  process.env.npm_config_global = 'true'

  await postinstall()
  t.equal(process.exitCode, undefined, 'exitCode is unset')
})

// We have 100% coverage via the coverage map
// so this is only for how the bin script control flow
t.test('with mocks', (t) => {
  t.plan(4)

  t.test('when patchPackage returns false no further action is taken', async (t) => {
    t.plan(2)

    process.env.npm_config_local_prefix = 'heynow'

    await postinstall({
      package: () => {
        t.pass('package is called')
        return false
      },
      content: () => {
        t.fail('not called')
      },
    })

    t.equal(process.exitCode, undefined, 'exitCode is unset')
  })

  t.test('when patchPackage returns true content is called', async (t) => {
    t.plan(3)

    process.env.npm_config_local_prefix = 'heynow'

    await postinstall({
      package: () => {
        t.pass('package is called')
        return true
      },
      content: () => {
        t.pass('content is called')
      },
    })

    t.equal(process.exitCode, undefined, 'exitCode is unset')
  })

  t.test('sets code and errors when throwing in content', async (t) => {
    process.env.npm_config_local_prefix = 'heynow'

    let stack

    await postinstall({
      package: () => true,
      content: () => {
        const e = new Error('whoops')
        stack = e.stack
        throw e
      },
    })

    t.strictSame(logs, [], 'logs')
    t.match(errors, [stack], 'errors')
    t.equal(process.exitCode, 1, 'exitCode is 1')
  })

  t.test('sets code and errors when throwing in package', async (t) => {
    process.env.npm_config_local_prefix = 'heynow'

    let stack

    await postinstall({
      package: () => {
        const e = new Error('whoops')
        stack = e.stack
        throw e
      },
    })

    t.strictSame(logs, [], 'logs')
    t.match(errors, [stack], 'errors')
    t.equal(process.exitCode, 1, 'exitCode is 1')
  })
})
