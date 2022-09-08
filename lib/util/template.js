const Handlebars = require('handlebars')
const { basename, extname, join } = require('path')
const fs = require('fs')
const DELETE = '__DELETE__'

const partialName = (s) => basename(s, extname(s)) // remove extension
  .replace(/^_/, '') // remove leading underscore
  .replace(/-([a-z])/g, (_, g) => g.toUpperCase()) // camelcase

const setupHandlebars = (...partialDirs) => {
  Handlebars.registerHelper('obj', ({ hash }) => hash)
  Handlebars.registerHelper('json', (c) => JSON.stringify(c))
  Handlebars.registerHelper('del', () => JSON.stringify(DELETE))

  // Load all files as camelcase partial names.
  // all other content dirs only get special underscore leading
  // files as partials. this prevents recursion loops when overwriting
  // a filename to use as a enw file
  let isBase = true
  for (const dir of partialDirs) {
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith('_') || isBase) {
        Handlebars.registerPartial(
          partialName(f),
          fs.readFileSync(join(dir, f)).toString()
        )
      }
    }
    isBase = false
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
