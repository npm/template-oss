const { format } = require('util')
const { get, omit, mergeWith: _mergeWith, merge: _merge, unset } = require('lodash')
const { diff } = require('just-diff')
const jsonParse = require('json-parse-even-better-errors')
const Diff = require('diff')
const nunjucks = require('nunjucks')

// create a patch and strip out the filename. if it ends up an empty string
// then return true since the files are equal
const strDiff = (t, s, { context = 4 } = {}) =>
  Diff.createPatch('', t, s, '', '', { context }).split('\n').slice(4).join('\n')

const merge = (t, s) => _merge({}, t, s)

const mergeWithCustomizer = (t, s, customizer) => _mergeWith({}, t, s, customizer)

const mergeWithArrays = (t, s) => mergeWithCustomizer(t, s, (value, srcValue) => {
  if (Array.isArray(srcValue) && Array.isArray(value)) {
    return value.concat(srcValue)
  }
})

const json2 = (obj, replacer = null) => JSON.stringify(obj, replacer, 2)
const jsonStringify = (s, DELETE) => json2(s, (_, v) => v === DELETE ? undefined : v)

// DELETE is a special string that will be the value of updated if it exists
// but should be deleted
const jsonDiff = (s1, s2, DELETE) => diff(s1, s2)
  .map(({ op, path, value }) => {
    // there could be cases where a whole object is reported
    // as missing and the expected value does not need to show
    // special DELETED values so filter those out here
    const msgVal = jsonStringify(value, (_, v) => v === DELETE ? undefined : v)
    const prev = json2(get(s1, path))
    const key = json2(path.reduce((acc, p) => acc + (typeof p === 'number' ? `[${p}]` : `.${p}`)))

    const msg = (...args) => format('%s is %s, expected %s', ...args)
    const AD = msg(key, 'missing', msgVal)
    const RM = msg(key, prev, 'to be removed')
    const UP = msg(key, prev, msgVal)

    if (op === 'replace') {
      return value === DELETE ? RM : UP
    } else if (op === 'add' && value !== DELETE) {
      return AD
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b))
  .join('\n')

const setFirst = (source, first = {}) => ({
  ...first,
  ...omit(source, Object.keys(first)),
})

const traverse = (value, visit, keys = []) => {
  if (keys.length) {
    const res = visit(keys, value)
    if (res != null) {
      return
    }
  }
  if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      traverse(v, visit, keys.concat(k))
    }
  }
}

const jsonDelete = (s, DELETE) => traverse(s, (keys, value) => {
  if (value === DELETE) {
    return unset(s, keys)
  }
})

const template = (str, { baseDirs, templateOptions, data, DELETE }) => {
  const arrOrNotFilter = (t) => (v, ...rest) =>
    Array.isArray(v) ? v.map(i => t(i, ...rest)) : t(v, ...rest)

  const loader = new nunjucks.FileSystemLoader(baseDirs, {
    noCache: true,
  })

  const env = new nunjucks.Environment(loader, merge({
    autoescape: false,
    throwOnUndefined: true,
    noCache: true,
    tags: {
      blockStart: '{#',
      blockEnd: '#}',
      variableStart: '{$',
      variableEnd: '$}',
      commentStart: '<#',
      commentEnd: '#>',
    },
  }, templateOptions))

  env.addFilter('pluck', (v, p) => v.map(i => i[p]))
  env.addFilter('pad', arrOrNotFilter((v, c = 2, f = '0') => v.toString().padStart(c, f)))
  env.addFilter('wrap', arrOrNotFilter((v, c) => c + v + c))

  return env.renderString(str, { ...data, DELETE: JSON.stringify(DELETE) })
}

module.exports = {
  jsonDiff,
  strDiff,
  jsonParse,
  jsonStringify,
  jsonDelete,
  setFirst,
  traverse,
  merge,
  template,
  mergeWithArrays,
  mergeWithCustomizer,
}
