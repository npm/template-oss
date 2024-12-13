const semver = require('semver')
const { Version } = require('release-please/build/src/version.js')

const inc = (version, releaseType, prereleaseMode, preid) => {
  const parsed = new semver.SemVer(version)
  const implicitPreid = parsed.prerelease.length > 1 ? parsed.prerelease[0]?.toString() : undefined
  const nextPreid = preid || implicitPreid

  const isMajor = parsed.minor === 0 && parsed.patch === 0
  const isMinor = parsed.patch === 0
  const isPrerelease = parsed.prerelease.length > 0

  const nextReleaseType =
    !prereleaseMode ? releaseType :                          // normal release
      !isPrerelease ? 'pre' + releaseType :                  // first prerelease
        !isMajor && releaseType === 'major' ? 'premajor' :   // minor or patch prerelease and major coming
          !isMinor && releaseType === 'minor' ? 'preminor' : // patch prerelease and minor coming
            'prerelease'                                     // next prerelease

  const next = new semver.SemVer(version).inc(nextReleaseType, nextPreid)
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
    const version = inc(currentVersion.toString(), releaseType, prerelease, tag)
    /* istanbul ignore next */
    if (!version) {
      throw new Error('Could not bump version')
    }
    return Version.parse(version)
  }
}

module.exports = { SemverVersioningStrategy }
