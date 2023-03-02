const semver = require('semver')
const { Version } = require('release-please/build/src/version.js')

// A way to compare the "level" of a release since we ignore some things during prereleases
const LEVELS = new Map([['prerelease', 4], ['major', 3], ['minor', 2], ['patch', 1]]
  .flatMap((kv) => [kv, kv.slice().reverse()]))

const parseVersion = (v) => {
  const { prerelease, minor, patch, version } = semver.parse(v)

  // This looks at whether there are 0s in certain positions of the version
  // 1.0.0 => major
  // 1.5.0 => minor
  // 1.5.6 => patch
  const release = !patch
    ? (minor ? LEVELS.get('minor') : LEVELS.get('major'))
    : LEVELS.get('patch')

  // Keep track of whether the version has any prerelease identifier
  const hasPre = prerelease.length > 0
  // Even if it is a prerelease version, this might be an empty string
  const preId = prerelease.filter(p => typeof p === 'string').join('.')

  return {
    version,
    release,
    prerelease: hasPre,
    preId,
  }
}

const parseCommits = (commits, prerelease) => {
  // Default is a patch level change
  let release = LEVELS.get('patch')

  for (const commit of commits) {
    if (commit.breaking) {
      // If any breaking commit is present, its a major
      release = LEVELS.get('major')
      break
    } else if (['feat', 'feature'].includes(commit.type)) {
      // Otherwise a feature is a minor release
      release = LEVELS.get('minor')
    }
  }

  return {
    release,
    prerelease: !!prerelease,
  }
}

const preInc = ({ version, prerelease, preId }, release) => {
  if (!release.startsWith('pre')) {
    release = `pre${release}`
  }

  // `pre` is the default prerelease identifier when creating a new
  // prerelease version
  return semver.inc(version, release, prerelease ? preId : 'pre')
}

const semverToVersion = (v) => {
  const { major, minor, patch, prerelease } = semver.parse(v)
  return new Version(major, minor, patch, prerelease.join('.'))
}

// This does not account for pre v1 semantics since we don't publish those
// Always 1.0.0 your initial versions!
module.exports = class DefaultVersioningStrategy {
  constructor (options) {
    this.prerelease = options.prerelease
  }

  bump (currentVersion, commits) {
    const next = parseCommits(commits, this.prerelease)
    // Release please passes in a version class with a toString() method
    const current = parseVersion(currentVersion.toString())

    // This is a special case where semver doesn't align exactly with what we want.
    // We are currently at a prerelease and our next is also a prerelease.
    // In this case we want to ignore the release type we got from our conventional
    // commits if the "level" of the next release is <= the level of the current one.
    //
    // This has the effect of only bumping the prerelease identifier and nothing else
    // when we are actively working (and breaking) a prerelease. For example:
    //
    // `9.0.0-pre.4` + breaking changes = `9.0.0-pre.5`
    // `8.5.0-pre.4` + breaking changes = `9.0.0-pre.0`
    // `8.5.0-pre.4` + feature or patch changes = `8.5.0-pre.5`
    if (current.prerelease && next.prerelease && next.release <= current.release) {
      next.release = LEVELS.get('prerelease')
    }

    const release = LEVELS.get(next.release)
    const releaseVersion = next.prerelease
      ? preInc(current, release)
      : semver.inc(current.version, release)
    return semverToVersion(releaseVersion)
  }
}

module.exports.semverToVersion = semverToVersion
