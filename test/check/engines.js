const t = require('tap')
const setup = require('../setup.js')

const setupEngines = ({ engines, omitEngines }) =>
  setup(t, {
    ok: true,
    package: {
      engines: { node: engines },
      templateOSS: {
        omitEngines,
      },
      dependencies: {
        eighteen: '1.0.0',
        sixteen: '1.0.0',
        nothing: '1.0.0',
        anything: '1.0.0',
        ohdoteight: '1.0.0',
      },
    },
    testdir: {
      node_modules: {
        nothing: {
          'package.json': JSON.stringify({
            name: 'nothing',
            version: '1.0.0',
          }),
        },
        anything: {
          'package.json': JSON.stringify({
            name: 'anything',
            version: '1.0.0',
            engines: {
              node: '*',
            },
          }),
        },
        ohdoteight: {
          'package.json': JSON.stringify({
            name: 'ohdoteight',
            version: '1.0.0',
            engines: {
              node: '>=0.8',
            },
          }),
        },
        eighteen: {
          'package.json': JSON.stringify({
            name: 'eighteen',
            version: '1.0.0',
            engines: {
              node: '>=18',
            },
          }),
        },
        sixteen: {
          'package.json': JSON.stringify({
            name: 'sixteen',
            version: '1.0.0',
            engines: {
              node: '>=16',
            },
          }),
        },
      },
    },
  })

const cases = [
  [['^14 || ^16 || >=18'], ['eighteen', 'sixteen']],
  [['^16 || >=18'], ['eighteen']],
  [['^16 || >=18', ['eighteen']], null],
  [['>=18'], null],
]

for (const [[engines, omitEngines], expected] of cases) {
  t.test(engines, async t => {
    const s = await setupEngines({ engines, omitEngines })
    await s.apply()
    const checks = await s.check()
    if (expected) {
      t.equal(checks.length, 1)
      for (const expect of expected) {
        t.match(checks[0].body, expect, expect)
      }
    } else {
      t.strictSame(checks, [])
    }
  })
}
