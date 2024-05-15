const { join } = require('path')
const { defaultsDeep, omit, isPlainObject } = require('lodash')
const deepMapValues = require('just-deep-map-values')
const { glob } = require('glob')
const { mergeWithCustomizers, customizers } = require('./merge.js')
const Parser = require('./parser.js')
const template = require('./template.js')

const ADD_KEY = 'add'
const RM_KEY = 'rm'
const FILE_KEYS = ['rootRepo', 'rootModule', 'workspaceRepo', 'workspaceModule']

const globify = pattern => pattern.split('\\').join('/')

const deepMapKeys = (obj, fn) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[fn(key)] = isPlainObject(value) ? deepMapKeys(value, fn) : value
    return acc
  }, {})

const mergeFiles = mergeWithCustomizers((value, srcValue, key, target, source, stack) => {
  // This will merge all files except if the src file has overwrite:false. Then
  // the files will be turned into an array so they can be applied on top of
  // each other in the parser.
  if (stack[0] === ADD_KEY && FILE_KEYS.includes(stack[1]) && value?.file && srcValue?.overwrite === false) {
    return [value, omit(srcValue, 'overwrite')]
  }
}, customizers.overwriteArrays)

const fileEntries = (dir, files, options) => {
  const results = []

  for (const [key, value] of Object.entries(files)) {
    // remove any false values first since that means those targets are skipped
    if (value === false) {
      continue
    }

    // target paths need to be joined with dir and templated
    const target = join(dir, template(key, options))

    // Allow an array of values to merge into a single source to be
    // applied or diffed against the target. This is how overwrite:false
    // works and they are merged.
    const source = Array.isArray(value)
      ? value.reduce(
          (acc, { file, ...rest }) => {
            acc.file.push(file)
            return Object.assign(acc, rest)
          },
          { file: [] },
        )
      : value

    results.push([target, source])
  }

  return results
}

// given an obj of files, return the full target/source paths and associated parser
const getParsers = (dir, files, options, parseOptions) => {
  const parsers = fileEntries(dir, files, options, parseOptions).map(([target, source]) => {
    const { file, parser, filter, clean: shouldClean } = source

    if (typeof filter === 'function' && !filter(options)) {
      return null
    }

    const clean = typeof shouldClean === 'function' ? shouldClean(options) : false

    if (parser) {
      // allow files to extend base parsers or create new ones
      return new (parser(Parser.Parsers))(target, file, options, { clean })
    }

    return new (Parser(target))(target, file, options, { clean })
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

const parseEach = async (dir, files, options, parseOptions, fn) => {
  const res = []
  for (const parser of getParsers(dir, files, options, parseOptions)) {
    res.push(await fn(parser))
  }
  return res.filter(Boolean)
}

const parseConfig = (files, dir, overrides, templateSettings) => {
  const normalizeFiles = v => {
    v = deepMapKeys(v, s => template(s, templateSettings))
    return deepMapValues(v, (value, key) => {
      if (key === RM_KEY && Array.isArray(value)) {
        return value.reduce((acc, k) => {
          // template files nows since they need to be normalized before merging
          acc[template(k, templateSettings)] = true
          return acc
        }, {})
      }
      if (typeof value === 'string') {
        const file = join(dir, value)
        return key === 'file' ? file : { file }
      }
      if (value === true && FILE_KEYS.includes(key)) {
        return {}
      }
      return value
    })
  }

  const merged = mergeFiles(normalizeFiles(files), normalizeFiles(overrides))
  const withDefaults = defaultsDeep(
    merged,
    FILE_KEYS.reduce((acc, k) => {
      acc[k] = { [ADD_KEY]: {}, [RM_KEY]: {} }
      return acc
    }, {}),
  )

  return withDefaults
}

const getAddedFiles = files => (files ? Object.keys(files[ADD_KEY] || {}) : [])

module.exports = {
  rmEach,
  parseEach,
  FILE_KEYS,
  parseConfig,
  getAddedFiles,
  mergeFiles,
}
