const intersects = require('semver/ranges/intersects')
const { has } = require('lodash')

const installLocations = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'bundledDependencies',
  'optionalDependencies',
]

const hasPackage = (
  pkg,
  name,
  version = '*',
  locations = installLocations
) => locations
  .map((l) => pkg[l])
  .some((deps) =>
    has(deps, name) &&
    (version === '*' || intersects(deps[name], version))
  )

module.exports = hasPackage

module.exports.flags = installLocations.reduce((acc, location) => {
  const type = location.replace(/dependencies/i, '')
  acc[location] = '--save' + (type ? `-${type}` : '')
  return acc
}, {})
