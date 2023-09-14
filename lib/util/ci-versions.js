const { uniq, range, isPlainObject } = require('lodash')
const semver = require('semver')

const parseCiVersions = (ciVersions) => {
  if (Array.isArray(ciVersions)) {
    return Object.fromEntries(ciVersions.map((v) => [v, true]))
  }
  if (isPlainObject(ciVersions)) {
    return ciVersions
  }
}

const getLowerBounds = (sRange) => {
  return new semver.Range(sRange).set.map(c => c[0])
}

const getCiVersions = (nodeEngines, pkgConfig) => {
  let allCiVersions = {}

  // get ci versions
  const { latestCiVersion, ciVersions } = pkgConfig

  if (latestCiVersion) {
    allCiVersions[`${latestCiVersion}.x`] = true
  }

  // determine the ci versions from the node engines set
  if (nodeEngines) {
    const lowerBounds = getLowerBounds(nodeEngines)
      .map(v => v.semver)
      .filter(v => v.version)

    for (const version of lowerBounds) {
      allCiVersions[version.version] = true
      allCiVersions[`${version.major}.x`] = true
    }

    const lowestCiVersion = semver.sort(lowerBounds)[0]?.major
    if (lowestCiVersion && latestCiVersion) {
      for (const major of range(lowestCiVersion, latestCiVersion, 2)) {
        allCiVersions[`${major}.x`] = true
      }
    }
  }

  if (ciVersions === 'latest' && latestCiVersion) {
    // the plain string 'latest' means latest only and everything else is removed
    allCiVersions = { [`${latestCiVersion}.x`]: true }
  } else {
    // this allows ciVersions to turn off default versions by setting them to a falsy value
    Object.assign(allCiVersions, parseCiVersions(ciVersions))
  }

  if (allCiVersions.latest && latestCiVersion) {
    delete allCiVersions.latest
    allCiVersions[`${latestCiVersion}.x`] = true
  }

  const filteredCiVersions = Object.entries(allCiVersions)
    .filter(([, v]) => v)
    .map(([k]) => k)

  return uniq(filteredCiVersions).sort((a, b) => {
    const aComp = getLowerBounds(a)[0]
    const bComp = getLowerBounds(b)[0]

    if (aComp.semver.major > bComp.semver.major) {
      return 1
    } else if (aComp.semver.major < bComp.semver.major) {
      return -1
    }

    return aComp.operator ? 1 : -1
  })
}

module.exports = {
  parse: parseCiVersions,
  get: getCiVersions,
}
