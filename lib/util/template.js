const Handlebars = require('handlebars')
const { basename, extname, join } = require('path')
const fs = require('fs')
const DELETE = '__DELETE__'

const safeValues = (obj) => Object.entries(obj).map(([key, value]) =>
  [key, new Handlebars.SafeString(value)])

const partialName = (s) => basename(s, extname(s)) // remove extension
  .replace(/^_/, '') // remove leading underscore
  .replace(/-([a-z])/g, (_, g) => g.toUpperCase()) // camelcase

const makePartials = (dir, isBase) => {
  const partials = fs.readdirSync(dir).reduce((acc, f) => {
    const partial = fs.readFileSync(join(dir, f)).toString()
    const name = partialName(f)

    if (isBase) {
      // in the default dir, everything is a partial
      // and also gets set with a default prefix for extending
      acc[name] = partial
      acc[partialName(`default-${name}`)] = partial
    } else if (f.startsWith('_')) {
      // otherwise only _ files get set as partials
      acc[name] = partial
    }

    return acc
  }, {})

  Handlebars.registerPartial(partials)
}

const setupHandlebars = (baseDir, ...otherDirs) => {
  Handlebars.registerHelper('obj', ({ hash }) => Object.fromEntries(safeValues(hash)))
  Handlebars.registerHelper('join', (arr, sep) => arr.join(typeof sep === 'string' ? sep : ', '))
  Handlebars.registerHelper('pluck', (arr, key) => arr.map(a => a[key]))
  Handlebars.registerHelper('reject', (arr, re) => arr.filter(a => !new RegExp(re).test(a)))
  Handlebars.registerHelper('quote', (arr) => arr.map(a => `'${a}'`))
  Handlebars.registerHelper('last', (arr) => arr[arr.length - 1])
  Handlebars.registerHelper('json', (c) => JSON.stringify(c))
  Handlebars.registerHelper('del', () => JSON.stringify(DELETE))

  makePartials(baseDir, true)
  for (const dir of otherDirs) {
    makePartials(dir)
  }
}

const template = (str, { config, ...options }) => {
  setupHandlebars(...config.__PARTIAL_DIRS__)

  const t = Handlebars.compile(str, { strict: true })

  // merge in config as top level data in templates
  return t({ ...options, ...config })
}

module.exports = template
module.exports.DELETE = DELETE
