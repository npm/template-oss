const Handlebars = require('handlebars')
const { basename, dirname, sep, extname, join, relative } = require('path')
const fs = require('fs')

const DELETE = '__DELETE__'

const partialName = (s) => {
  const dir = dirname(s)
  return join(dir === '.' ? '' : dir, basename(s, extname(s)))// remove extension
    // camelcase with -, /, and \\ as separators
    .replace(/(?:[-/]|\\)([a-z])/g, (_, g) => g.toUpperCase())
}

const walkDir = (dir, res = [], root = dir) => {
  const contents = fs.readdirSync(dir)
  for (const c of contents) {
    if (c.startsWith('.')) {
      continue
    }
    const itemPath = join(dir, c)
    if (fs.statSync(itemPath).isDirectory()) {
      walkDir(itemPath, res, root)
    } else {
      res.push({
        name: relative(root, itemPath),
        path: itemPath,
      })
    }
  }
  return res
}

const getPartials = (dir, isBase) => walkDir(dir).reduce((acc, f) => {
  const partial = fs.readFileSync(f.path).toString()
  const name = partialName(f.name)

  if (isBase) {
    // in the default dir, everything is a partial
    // and also gets set with a default prefix for extending
    acc[name] = partial
    acc[partialName(`default-${name}`)] = partial
  } else if (f.name.startsWith('partials' + sep)) {
    // otherwise only files in partials dir get set as partials
    acc[name] = partial
  }

  return acc
}, {})

const setupHandlebars = (baseDir, ...otherDirs) => {
  Handlebars.registerHelper('join', (arr, s) => arr.join(typeof s === 'string' ? s : ', '))
  Handlebars.registerHelper('pluck', (arr, key) => arr.map(a => a[key]))
  Handlebars.registerHelper('quote', (arr) => arr.map(a => `'${a}'`))
  Handlebars.registerHelper('last', (arr) => arr[arr.length - 1])
  Handlebars.registerHelper('first', (arr) => arr[0])
  Handlebars.registerHelper('add', (num, addend) => +num + +addend)
  Handlebars.registerHelper('padHour', (num) => num.toString().padStart(2, '0'))
  Handlebars.registerHelper('json', (c) => JSON.stringify(c))
  Handlebars.registerHelper('del', () => JSON.stringify(DELETE))
  Handlebars.registerHelper('newline', () => '\n')

  Handlebars.registerPartial(getPartials(baseDir, true))
  for (const dir of otherDirs) {
    Handlebars.registerPartial(getPartials(dir))
  }
}

const template = (str, options) => {
  if (options.baseDirs) {
    setupHandlebars(...options.baseDirs)
  }
  const t = Handlebars.compile(str, { strict: true })
  // merge in data as top level data in templates
  return t({ ...options, ...options.data })
}

module.exports = template
module.exports.DELETE = DELETE
