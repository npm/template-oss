const { isAbsolute, resolve, dirname } = require('path')

const DEFAULT_CONFIG = '@npmcli/template-oss-config'

const getExtends = (configExtends) => {
  const ext = Array.isArray(configExtends) ? configExtends : [configExtends]

  // Pretend every package that consumes this has extended our config
  // by default. In the future this will be opt-in.
  if (!ext.includes(DEFAULT_CONFIG) && !ext.includes(null)) {
    ext.unshift(DEFAULT_CONFIG)
  }

  return ext.filter(Boolean)
}

const resolvePath = (content, baseDir = '') => {
  if (!content) {
    return
  }
  try {
    // can it be required?
    return require.resolve(content)
  } catch {
    return isAbsolute(content) ? content : resolve(baseDir, content)
  }
}

const readContent = (contentPath, dir) => {
  const path = resolvePath(contentPath, dir)
  if (!path) {
    return
  }
  try {
    return { config: require(path), baseDir: dirname(path) }
  } catch {
    // its ok if this fails since the content dir
    // might only be to provide other files. the
    // index.js is optional
    return { config: {}, baseDir: path }
  }
}

const resolveConfigs = ({ config, path, configExtends }) => [
  ...getExtends(configExtends).map(c => readContent(c, path)),
  {
    config: config,
    baseDir: path,
  },
].filter(Boolean)

module.exports = {
  resolveConfigs,
  resolvePath,
}
