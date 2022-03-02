const JsonDiff = require('json-diff')
const { has } = require('lodash')
const traverse = require('./traverse.js')

const tracker = (DELETE) => {
  // there could be cases where a whole object is reported
  // as missing and the expected value does not need to show
  // special DELETED values so filter those out here
  const j = (obj) =>
    JSON.stringify(obj, (k, v) => v === DELETE ? undefined : v, 2)
  const results = []
  return {
    format () {
      if (!results.length) {
        return true
      }
      return results.map((d) =>
        d.ADD ? `${j(d.key)} is missing, expected ${j(d.value)}` :
        d.UPDATE ? `${j(d.key)} is ${j(d.old)}, expected ${j(d.value)}` :
        `${j(d.key)} is ${j(d.old)}, expected to be removed`
      ).sort((a, b) => a.localeCompare(b)).join('\n')
    },
    ADD: (key, value) => results.push({ key, value, ADD: 'ADD' }),
    REMOVE: (key, old) => results.push({ key, old, REMOVE: 'REMOVE' }),
    UPDATE: (key, old, value) => results.push({ key, old, value, UPDATE: 'UPDATE' }),
  }
}

const jsonDiff = (s1, s2, DELETE) => {
  const track = tracker(DELETE)

  // s2 is allowed to be a subset of s1, so we dont need to mark __deleted here
  // DELETE is a special string that will be the value of updated if it exists
  // but should be deleted.

  traverse(JsonDiff.diff(s1, s2), (keys, value) => {
    const lastKey = keys[keys.length - 1]
    const key = keys.map((k) => k.replace(/__(deleted|added)$/, '')).join('.')

    if (lastKey.endsWith('__added') && value !== DELETE) {
      // key needs to be added
      return track.ADD(key, value)
    } else if (has(value, '__old') && has(value, '__new')) {
      // key needs to be removed or upated
      const { __new: added, __old: old } = value
      return added === DELETE ? track.REMOVE(key, old) : track.UPDATE(key, old, added)
    } else if (Array.isArray(value) && ['-', '+'].includes(value[0])) {
      // array item needs to be removed or added
      const [flag, v] = value
      return flag === '-' ? track.REMOVE(key, v) : track.ADD(key, v)
    }
  })

  return track.format()
}

module.exports = jsonDiff
