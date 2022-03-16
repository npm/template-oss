const semver = require('semver')
const { partition, uniq, groupBy } = require('lodash')

// try to parse a version. if its invalid then
// try to parse it as a range instead
const versionOrRange = (v) => semver.parse(v) || new semver.Range(v)

// get the version or the upper bound of the range
// used for sorting to give the latest ci target
const getMaxVersion = (v) => v.version || v.set[0][1].semver.version

// given an array of versions, returns an object where
// each key is a major and each value is a sorted list of versions
const versionsByMajor = (versions) => {
  const majors = groupBy(versions, (v) => semver.major(v))
  for (const [k, vs] of Object.entries(majors)) {
    majors[k] = semver.sort(vs)[0]
  }
  return majors
}

// given a list of semver ci targets like:
// ['12.13.0', '12.x', '14.15.0', '14.x', '16.0.0', '16.x']
// this will parse into a uniq list of lowest "supported"
// versions. In our cases so that will return
// '^12.13.0 || ^14.15.0 || >=16'. This is not super generic but fits
// our use case for now where we want to test on a bunch of
// specific versions/ranges and map them to somewhat loose
// semver range for package.json#engines.node. This only supports
// returning ^ ranges and makes the last version >= currently.
//
// Assumptions:
// - ranges span a single major version
// - specific versions are lower then the upper bound of
//   ranges within the same major version
const parseCITargets = (targets = []) => {
  const [versions, ranges] = partition(
    targets.map((t) => versionOrRange(t)),
    (t) => t.version
  )

  const sorted = [...versions, ...ranges]
    .sort((a, b) => semver.compareBuild(getMaxVersion(a), getMaxVersion(b)))
    .map((v) => v.version || v.raw)

  // object of {major: lowestVersion } for all passed in versions
  const minVersions = versionsByMajor(versions)

  // object of {major: lowestVersionInRange } for all passed in ranges
  const minRanges = versionsByMajor(ranges.map((r) => semver.minVersion(r)))

  // Given all the uniq major versions in targets...
  const parsedRanges = uniq([...Object.keys(minVersions), ...Object.keys(minRanges)])
    // first sort by major to make it display nicer
    .sort((a, b) => Number(a) - Number(b))
    .map((major) => {
      const minVersion = minVersions[major]
      const minRange = minRanges[major]
      // if we only have one then return that
      if (!minVersion || !minRange) {
        return minVersion || minRange
      }
      // otherwise return min version
      // XXX: this assumes the versions are lower than the upper
      // bound for any range for the same major. This is ok for
      // now but will break with more complex/specific semver ranges
      return minVersion
    })
    // make the last version allow all greater than
    .map((v, index, list) => (index === list.length - 1 ? '>=' : '^') + v)

  return {
    targets: sorted,
    engines: parsedRanges.join(' || '),
  }
}

module.exports = parseCITargets
