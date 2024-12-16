const semver = require('semver')
const { Version } = require('release-please/build/src/version.js')

const inc = (version, release, _preid) => {
  const parsed = new semver.SemVer(version)
  const implicitPreid = parsed.prerelease.length > 1 ? parsed.prerelease[0]?.toString() : undefined
  const preid = _preid || implicitPreid
  const next = new semver.SemVer(version).inc(release, preid)
  if (!parsed.prerelease.length) {
    return next.format()
  }
  const isFreshMajor = parsed.minor === 0 && parsed.patch === 0
  const isFreshMinor = parsed.patch === 0
  const shouldPrerelease =
    (release === 'premajor' && isFreshMajor) || (release === 'preminor' && isFreshMinor) || release === 'prepatch'
  if (shouldPrerelease) {
    return semver.inc(version, 'prerelease', preid)
  }
  return next.format()
}

const parseCommits = commits => {
  let release = 'patch'
  for (const commit of commits) {
    if (commit.breaking) {
      release = 'major'
      break
    } else if (['feat', 'feature'].includes(commit.type)) {
      release = 'minor'
    }
  }
  return release
}

class SemverVersioningStrategyNested {
  constructor(options, version, commits) {
    this.options = options
    this.commits = commits
    this.version = version
  }

  bump() {
    return new SemverVersioningStrategy(this.options).bump(this.version, this.commits)
  }
}

class SemverVersioningStrategy {
  constructor(options) {
    this.options = options
  }

  determineReleaseType(version, commits) {
    return new SemverVersioningStrategyNested(this.options, version, commits)
  }

  bump(currentVersion, commits) {
    const prerelease = this.options.prerelease
    const tag = this.options.prereleaseType
    const releaseType = parseCommits(commits)
    const addPreIfNeeded = prerelease ? `pre${releaseType}` : releaseType
    const version = inc(currentVersion.toString(), addPreIfNeeded, tag)
    /* c8 ignore start */
    if (!version) {
      throw new Error('Could not bump version')
    }
    /* c8 ignore stop */
    return Version.parse(version)
  }
}

module.exports = { SemverVersioningStrategy }
