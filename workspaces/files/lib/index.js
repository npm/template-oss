const { join } = require('path')
const { promisify } = require('util')
const { defaultsDeep } = require('lodash')
const deepMapValues = require('just-deep-map-values')
const glob = promisify(require('glob'))
const merge = require('./merge.js')
const Parser = require('./parser.js')
const template = require('./template.js')

const globify = pattern => pattern.split('\\').join('/')

const fileEntries = (dir, files, options) => Object.entries(files)
  // remove any false values
  .filter(([_, v]) => v !== false)
  // target paths need to be joinsed with dir and templated
  .map(([k, source]) => {
    const target = join(dir, template(k, options))
    return [target, source]
  })

// given an obj of files, return the full target/source paths and associated parser
const getParsers = (dir, files, options) => {
  const parsers = fileEntries(dir, files, options).map(([target, source]) => {
    const { file, parser, filter } = source

    if (typeof filter === 'function' && !filter(options)) {
      return null
    }

    if (parser) {
      // allow files to extend base parsers or create new ones
      const FoundParser = parser(Parser.Parsers, options)
      if (FoundParser) {
        return new FoundParser(target, file, options)
      }
    }

    return new (Parser(file))(target, file, options)
  })

  return parsers.filter(Boolean)
}

const getRemovals = async (dir, files, options) => {
  const targets = fileEntries(dir, files, options)
    .filter(([, source]) => {
      if (typeof source === 'object' && typeof source.filter === 'function') {
        return source.filter(options)
      }
      return true
    })
    .map(([t]) => globify(t))
  const globs = await Promise.all(targets.map(t => glob(t, { cwd: dir })))
  return globs.flat()
}

const rmEach = async (dir, files, options, fn) => {
  const res = []
  for (const file of await getRemovals(dir, files, options)) {
    res.push(await fn(file))
  }
  return res.filter(Boolean)
}

const parseEach = async (dir, files, options, fn) => {
  const res = []
  for (const parser of getParsers(dir, files, options)) {
    res.push(await fn(parser))
  }
  return res.filter(Boolean)
}

const parseConfigFiles = (files, dir, overrides, configKeys) => {
  const normalizeFiles = (v) => deepMapValues(v, (value, key) => {
    if (key === 'rm' && Array.isArray(value)) {
      return value.reduce((acc, k) => {
        acc[k] = true
        return acc
      }, {})
    }
    if (typeof value === 'string') {
      const file = join(dir, value)
      return key === 'file' ? file : { file }
    }
    if (value === true && configKeys.includes(key)) {
      return {}
    }
    return value
  })

  const merged = merge(normalizeFiles(files), normalizeFiles(overrides))
  const withDefaults = defaultsDeep(merged, configKeys.reduce((acc, k) => {
    acc[k] = { add: {}, rm: {} }
    return acc
  }, {}))

  return withDefaults
}

module.exports = {
  rmEach,
  parseEach,
  parseConfigFiles,
}
