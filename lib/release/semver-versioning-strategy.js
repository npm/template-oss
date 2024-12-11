const semver = require('semver');
const { Version } = require('release-please/build/src/version.js');

const inc = (version, release, _preid) => {
  const parsed = new semver.SemVer(version);
  const implicitPreid =
    parsed.prerelease.length > 1 ? parsed.prerelease[0]?.toString() : undefined;
  const preid = _preid || implicitPreid;
  const next = new semver.SemVer(version).inc(release, preid);
  const isFreshMajor = parsed.minor === 0 && parsed.patch === 0;
  const isFreshMinor = parsed.patch === 0;
  if (
    parsed.prerelease.length &&
    next.prerelease.length &&
    ((release === 'premajor' && isFreshMajor) ||
      (release === 'preminor' && isFreshMinor) ||
      release === 'prepatch')
  ) {
    return semver.inc(version, 'prerelease', preid);
  }
  return semver.inc(version, release, preid);
};

const parseCommits = (commits) => {
  let release = 'patch';
  for (const commit of commits) {
    if (commit.breaking) {
      release = 'major';
      break;
    } else if (['feat', 'feature'].includes(commit.type)) {
      release = 'minor';
    }
  }
  return release;
};

class SemverVersioningStrategy {
  constructor(options) {
    this.options = options;
  }

  determineReleaseType(_version, _commits) {
    const options = this.options;
    class Shell {
      bump() {
        return new SemverVersioningStrategy(options).bump(_version, _commits);
      }
    }
    return new Shell();
  }

  bump(currentVersion, commits) {
    const prerelease = this.options.prerelease;
    const tag = this.options.prereleaseType;
    const releaseType = parseCommits(commits);
    const addPreIfNeeded = prerelease ? `pre${releaseType}` : releaseType;
    const version = inc(currentVersion.toString(), addPreIfNeeded, tag);
    /* istanbul ignore next */
    if (!version) {  
      throw new Error('Could not bump version');
    }
    return Version.parse(version);
  }
}

module.exports = { SemverVersioningStrategy };
