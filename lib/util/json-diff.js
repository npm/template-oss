const { format } = require('util')
const { get } = require('lodash')
const { diff } = require('just-diff')

const j = (obj, replacer = null) => JSON.stringify(obj, replacer, 2)

const jsonDiff = (s1, s2, DELETE) => {
  // DELETE is a special string that will be the value of updated if it exists
  // but should be deleted

  const ops = diff(s1, s2).map(({ op, path, value }) => {
    // there could be cases where a whole object is reported
    // as missing and the expected value does not need to show
    // special DELETED values so filter those out here
    const msgVal = j(value, (_, v) => v === DELETE ? undefined : v)
    const prev = j(get(s1, path))
    const key = j(path.reduce((acc, p) => acc + (typeof p === 'number' ? `[${p}]` : `.${p}`)))

    const msg = (...args) => format('%s is %s, expected %s', ...args)
    const AD = msg(key, 'missing', msgVal)
    const RM = msg(key, prev, 'to be removed')
    const UP = msg(key, prev, msgVal)

    if (op === 'replace') {
      return value === DELETE ? RM : UP
    } else if (op === 'add' && value !== DELETE) {
      return AD
    }
  }).filter(Boolean).sort((a, b) => a.localeCompare(b))

  if (!ops.length) {
    return true
  }

  return ops.join('\n')
}

module.exports = jsonDiff
