const { join } = require('path')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const minimatch = require('minimatch')
const { orderBy } = require('lodash')
const Base = require('./parser.js')
const { template, merge } = require('./util.js')
const Parsers = require('./parsers.js')

const globify = pattern => pattern.split('\\').join('/')

const orderMatches = (keys) => orderBy(
  keys,
  (k) => k.includes('*'),
  'asc'
)

const defaultMatches = {
  CODEOWNERS: Parsers.Gitignore,
  '.gitignore': Parsers.Gitignore,
  '*.js': Parsers.Js,
  '*.ini': Parsers.Ini,
  '.npmrc': Parsers.IniMerge,
  '*.md': Parsers.Markdown,
  '*.yml': Parsers.Yml,
  '*.json': Parsers.Json,
  'package.json': Parsers.PackageJson,
}

const defaultMatchLookup = orderMatches(Object.keys(defaultMatches))

const matchParser = (file, matches = {}) => {
  const matchLookup = orderMatches(Object.keys(matches)).concat(defaultMatchLookup)
  const matchKey = matchLookup.find((k) => minimatch(file, `**/${k}`, { dot: true }))
  if (matchKey) {
    return matches[matchKey] ?? defaultMatches[matchKey]
  }
}

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

    let FileParser

    if (typeof parser === 'function') {
      // allow files to extend base parsers or create new ones
      // parsers can be returned conditionally so if nothing was returned
      // fall back to the default parser for this file
      FileParser = Object.prototype.isPrototypeOf.call(Base, parser)
        ? parser
        : parser(options)
    } else if (parser) {
      options.rule.parser.options = merge(options.rule.parser.options, parser)
    }

    if (!FileParser) {
      FileParser = matchParser(target, options.rule.parser?.matches)
    }

    return new (FileParser ?? Base)(target, file, options)
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
    options.log.verbose('PARSER:', parser.constructor.name, parser.options.state.count)
    options.log.verbose('SOURCE:', options.pkg.relativeToRoot(parser.source))
    options.log.verbose('TARGET:', options.pkg.relativeToRoot(parser.target))
    res.push(await fn(parser))
  }
  return res.filter(Boolean)
}

module.exports = {
  rmEach,
  parseEach,
}
