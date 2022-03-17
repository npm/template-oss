const semver = require('semver')
const npa = require('npm-package-arg')
const { has } = require('lodash')
const { join } = require('path')

const installLocations = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'bundledDependencies',
  'optionalDependencies',
]

// from a spec get either a semver version or range. it gets parsed with npa and
// only a few appropriate types are handled. eg this doesnt match any git
// shas/tags, etc
const getSpecVersion = (spec, where) => {
  const arg = npa(spec, where)
  switch (arg.type) {
    case 'range':
      return new semver.Range(arg.fetchSpec)
    case 'tag': {
      // special case an empty spec to mean any version
      return arg.rawSpec === '' && new semver.Range('*')
    }
    case 'version':
      return new semver.SemVer(arg.fetchSpec)
    case 'directory': {
      // allows this repo to use a file spec as a devdep and pass this check
      const pkg = require(join(arg.fetchSpec, 'package.json'))
      return new semver.SemVer(pkg.version)
    }
  }
  return null
}

const isVersion = (s) => s instanceof semver.SemVer

// Returns whether the pkg has the dependency in a semver
// compatible version in one or more locationscccc
const hasPackage = (
  pkg,
  spec,
  locations = installLocations,
  path
) => {
  const name = npa(spec).name
  const requested = getSpecVersion(spec)

  if (!requested) {
    return false
  }

  const existingByLocation = locations
    .map((location) => pkg[location])
    .filter((deps) => has(deps, name))
    .map((deps) => getSpecVersion(`${name}@${deps[name]}`, path))
    .filter(Boolean)

  return existingByLocation.some((existing) => {
    switch ([existing, requested].map((t) => isVersion(t) ? 'VER' : 'RNG').join('-')) {
      case `VER-VER`:
        // two versions, use semver.eq to check equality
        return semver.eq(existing, requested)
      case `RNG-RNG`:
        // two ranges, existing must be entirely within the requested
        return semver.subset(existing, requested)
      case `VER-RNG`:
        // requesting a range with existing version is ok if it satisfies
        return semver.satisfies(existing, requested)
      case `RNG-VER`:
        // requesting a pinned version but has a range, always false
        return false
    }
  })
}

module.exports = hasPackage
module.exports.flags = installLocations.reduce((acc, location) => {
  const type = location.replace(/dependencies/i, '')
  acc[location] = '--save' + (type ? `-${type}` : '')
  return acc
}, {})
