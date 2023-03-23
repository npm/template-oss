const { isAbsolute, resolve, dirname } = require('path')
const { omit } = require('lodash')
const { defaultConfig } = require('./constants')

const tryResolve = (path, fallback) => {
  try {
    return require.resolve(path)
  } catch {
    return fallback ? path : null
  }
}

const getExtends = (configExtends = []) => {
  const ext = Array.isArray(configExtends) ? configExtends : [configExtends]

  // Pretend every package that consumes this has extended our config
  // by default. In the future this will be opt-in.
  if (!ext.includes(defaultConfig) && !ext.includes(null)) {
    ext.unshift(defaultConfig)
  }

  return ext.filter(Boolean)
}

const resolvePath = (content, baseDir) => {
  if (!content) {
    return
  }

  // can it be required as a plain package name or path
  const resolvedContent = tryResolve(content)
  if (resolvedContent) {
    return resolvedContent
  }

  // otherwise only return if its an absolute path
  if (isAbsolute(content)) {
    return content
  }

  // if not then try to require the resolved path if a basedir
  // was included
  if (baseDir) {
    return tryResolve(resolve(baseDir, content), true)
  }
}

const readExtends = (contentPath) => {
  const path = resolvePath(contentPath)
  if (!path) {
    return
  }
  try {
    return {
      config: require(path),
      baseDir: dirname(path),
    }
  } catch {
    // its ok if this fails since the content dir might only be to provide other
    // files. the index.js is optional
    return {
      config: {},
      baseDir: path,
    }
  }
}

const resolveConfig = (path, config) => {
  return [
    ...getExtends(config.extends).map((c) => readExtends(c)),
    {
      config: omit(config, 'extends'),
      baseDir: path,
    },
  ].filter(Boolean)
}

module.exports = {
  resolveConfig,
  resolvePath,
}
