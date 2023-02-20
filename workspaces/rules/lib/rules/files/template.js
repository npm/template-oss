const nunjucks = require('nunjucks')

const DELETE = '__DELETE__'

const arrOrNotFilter = (t) => (v, ...rest) =>
  Array.isArray(v) ? v.map(i => t(i, ...rest)) : t(v, ...rest)

const template = (str, options) => {
  const loader = new nunjucks.FileSystemLoader(options.baseDirs, {
    noCache: true,
  })

  const env = new nunjucks.Environment(loader, {
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
  })

  env.addFilter('pluck', (v, p) => v.map(i => i[p]))
  env.addFilter('pad', arrOrNotFilter((v, c = 2, f = '0') => v.toString().padStart(c, f)))
  env.addFilter('wrap', arrOrNotFilter((v, c) => c + v + c))

  // merge in data as top level data in templates
  const data = { ...options, ...options.pkg.data, DELETE: JSON.stringify(DELETE) }
  return env.renderString(str, data)
}

module.exports = template
module.exports.DELETE = DELETE
