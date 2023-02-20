const { join } = require('path')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const Parser = require('./parser.js')
const template = require('./template.js')

const globify = pattern => pattern.split('\\').join('/')

const fileEntries = ({ files, dir }, options) => Object.entries(files)
  // remove any false values
  .filter(([_, v]) => v !== false)
  // target paths need to be joinsed with dir and templated
  .map(([k, source]) => {
    const target = join(dir, template(k, options))
    return [target, source]
  })

// given an obj of files, return the full target/source paths and associated parser
const getParsers = (fileOptions, options) => {
  const parsers = fileEntries(fileOptions, options).map(([target, source]) => {
    const { file, parser, filter } = source

    if (typeof filter === 'function' && !filter(options)) {
      return null
    }

    const parserOptions = {
      ...options,
      baseDirs: fileOptions.baseDirs,
    }

    if (parser) {
      // allow files to extend base parsers or create new ones
      const FoundParser = parser(Parser.Parsers, options)
      // parsers can be returned conditionally so if nothing was returned
      // fall back to the default parser for this file
      if (FoundParser) {
        return new FoundParser(target, file, parserOptions)
      }
    }

    return new (Parser(file, options))(target, file, parserOptions)
  })

  return parsers.filter(Boolean)
}

const getRemovals = async (fileOptions, options) => {
  const targets = fileEntries(fileOptions, options)
    .filter(([, source]) => {
      if (typeof source === 'object' && typeof source.filter === 'function') {
        return source.filter(options)
      }
      return true
    })
    .map(([t]) => globify(t))
  const globs = await Promise.all(targets.map(t => glob(t, { cwd: fileOptions.dir })))
  return globs.flat()
}

const rmEach = async (fileOptions, options, fn) => {
  const res = []
  for (const file of await getRemovals(fileOptions, options)) {
    res.push(await fn(file))
  }
  return res.filter(Boolean)
}

const parseEach = async (fileOptions, options, fn) => {
  const res = []
  for (const parser of getParsers(fileOptions, options)) {
    // try {
    res.push(await fn(parser))
    // } catch (err) {
    //   options.log.error(parser.target, parser.source, err)
    // }
  }
  return res.filter(Boolean)
}

module.exports = {
  rmEach,
  parseEach,
}
