const Handlebars = require('handlebars')
const { basename, extname, join } = require('path')
const fs = require('fs')
const DELETE = '__DELETE__'

const partialName = (s) =>
  basename(s, extname(s)).replace(/-([a-z])/g, (_, g) => g.toUpperCase())

const setupHandlebars = (partialsDir) => {
  Handlebars.registerHelper('obj', ({ hash }) => hash)
  Handlebars.registerHelper('json', (c) => JSON.stringify(c))
  Handlebars.registerHelper('del', () => JSON.stringify(DELETE))

  // Load all content files as camelcase partial names
  for (const f of fs.readdirSync(join(partialsDir))) {
    Handlebars.registerPartial(
      partialName(f),
      fs.readFileSync(join(partialsDir, f)).toString()
    )
  }
}

const cache = new Map()

const template = (str, { config, ...options }) => {
  if (cache.size === 0) {
    setupHandlebars(config.sourceDir)
  }

  let t = cache.get(str)
  if (t == null) {
    t = Handlebars.compile(str, { strict: true })
    cache.set(str, t)
  }

  // merge in config as top level data in templates
  return t({ ...options, ...config })
}

module.exports = template
module.exports.DELETE = DELETE
