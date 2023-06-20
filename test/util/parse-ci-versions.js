const t = require('tap')
const parse = require('../../lib/util/parse-ci-versions.js')

const targets = [
  [[], ''],
  [undefined, ''],
  [['12.1.0'], '>=12.1'],
  [['12.0.1'], '>=12.x.1'],
  [['12.1.0', '12.2.0', '12'], '>=12.1'],
  [['12'], '>=12'],
  [['~12.5'], '>=12.5'],
  [['12.99.0', '12.1.1'], '>=12.1.1'],
  [['12.1.0', '12.x', '18.5.0'], '^12.1 || >=18.5'],
  [['12.1.0', '12.x', '^18'], '^12.1 || >=18', '^18'],
  [['12.1.0', '12.2.0', '~12.5'], '>=12.1', '~12.5'],
  [['12.13.0', '12.x', '14.15.0', '14.x', '16.0', '16.x'],
    '^12.13 || ^14.15 || >=16', '16.x'],
  // this is to test current behavior but these go against
  // the assumption that provided versions will always be lower
  // then the upper bound of the range
  [['12.99.0', '12.1.x'], '>=12.99'],
  [['12.99.0', '12.100.0', '12.50.0', '12.2.x', '12.5.x'], '>=12.50'],
]

targets.forEach(([target, engine, max]) => {
  const found = parse(target)
  t.equal(found.engines, engine, `${target} => ${engine}`)
  if (max) {
    t.equal(found.targets[found.targets.length - 1], max, 'sorted max version')
  }
})
