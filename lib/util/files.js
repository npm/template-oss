const { join } = require('path')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const Parser = require('./parser.js')
const template = require('./template.js')

// target paths need to be joinsed with dir and templated
const fullTarget = (dir, file, options) => join(dir, template(file, options))

// given an obj of files, return the full target/source paths and associated parser
const getParsers = (dir, files, options) => Object.entries(files).map(([t, s]) => {
  let {
    file,
    parser: fileParser,
    filter,
  } = typeof s === 'string' ? { file: s } : s

  file = join(options.config.sourceDir, file)
  const target = fullTarget(dir, t, options)

  if (typeof filter === 'function' && !filter(options)) {
    return null
  }

  if (fileParser) {
    // allow files to extend base parsers or create new ones
    return new (fileParser(Parser.Parsers))(target, file, options)
  }

  return new (Parser(file))(target, file, options)
})

const rmEach = async (dir, files, options, fn) => {
  const res = []
  for (const target of files.map((t) => fullTarget(dir, t, options))) {
    for (const file of await glob(target, { cwd: dir })) {
      res.push(await fn(file))
    }
  }
  return res.filter(Boolean)
}

const parseEach = async (dir, files, options, fn) => {
  const res = []
  for (const parser of getParsers(dir, files, options)) {
    if (parser) {
      res.push(await fn(parser))
    }
  }
  return res.filter(Boolean)
}

module.exports = {
  rmEach,
  parseEach,
}
