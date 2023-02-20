const nunjucks = require('nunjucks')

const DELETE = '__DELETE__'

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
  env.addFilter('pad', (s, count, fill) => s.toString().padStart(count ?? 2, fill ?? '0'))
  env.addFilter('pluck', (arr, prop) => arr.map(item => item[prop]))
  env.addFilter('wrap', (s, c) => Array.isArray(s) ? s.map(i => `${c}${i}${c}`) : `${c}${s}${c}`)
  // merge in data as top level data in templates
  const data = { ...options, ...options.data, del: JSON.stringify(DELETE) }
  return env.renderString(str, data)
}

module.exports = template
module.exports.DELETE = DELETE
