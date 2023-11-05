const { join, relative } = require('path')
const { makePosix } = require('./path.js')

const getCmdPath = (key, { pkgConfig, rootConfig, isRoot, pkg, rootPkg }) => {
  const result = (local, isRelative) => {
    let root = local
    const isLocal = local.startsWith('.') || local.startsWith('/')

    if (isLocal) {
      if (isRelative) {
        // Make a path relative from a workspace to the root if we are in a workspace
        local = makePosix(join(relative(pkg.path, rootPkg.path), local))
      }
      local = `node ${local}`
      root = `node ${root}`
    }

    return {
      isLocal,
      local,
      root,
    }
  }

  if (pkgConfig[key]) {
    return result(pkgConfig[key])
  }

  if (rootConfig[key]) {
    return result(rootConfig[key], !isRoot)
  }

  return result(key)
}

module.exports = getCmdPath
