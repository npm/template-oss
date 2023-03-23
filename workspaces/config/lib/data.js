const semver = require('semver')
const parseCIVersions = require('./parse-ci-versions.js')

const defaults = {
  windowsCI: true,
  macCI: true,
  defaultBranch: 'main',
  releaseBranches: 'release/v*',
  branches: ['main', 'latest'],
  distPaths: ['bin/', 'lib/'],
  allowPaths: ['**/.gitignore', ...[
    'bin/',
    'lib/',
    '.eslintrc.local.*',
    'docs/',
    'tap-snapshots/',
    'test/',
    'scripts/',
    'README*',
    'LICENSE*',
    'CHANGELOG*',
    'map.js',
  ].map(l => `/${l}`)],
  ignorePaths: [],
  ciVersions: ['14.17.0', '14.x', '16.13.0', '16.x', '18.0.0', '18.x'],
  lockfile: false,
  org: 'npm',
  codeowner: '@npm/cli-team',
  npm: 'npm',
  npx: 'npx',
  npmSpec: 'latest',
  shell: 'bash',
  runsOn: 'ubuntu-latest',
  dependabot: 'increase-if-necessary',
  changelogTypes: [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'docs', section: 'Documentation', hidden: false },
    { type: 'deps', section: 'Dependencies', hidden: false },
    { type: 'chore', hidden: true },
  ],
}

const localCmdPath = (key, data, { pkg }) => {
  const cmdPath = data[key]

  if (cmdPath === defaults[key]) {
    return
  }

  // Make a path relative from a workspace to the root if we are in a workspace
  const pkgPath = pkg.isRoot ? cmdPath : pkg.relativeToRoot(cmdPath)

  return {
    root: `node ${cmdPath}`,
    pkg: `node ${pkgPath}`,
  }
}

const postData = (data, options) => {
  const parentData = [options.pkg.isRoot ? null : options.rootPkg.data, defaults].filter(Boolean)

  const values = {}

  // whether to install and update npm in ci, only do this if we aren't using a custom path to bin
  const localNpm = localCmdPath('npm', data, options)
  Object.assign(values, {
    updateNpm: !localNpm,
    rootNpmPath: localNpm?.root ?? defaults.npm,
    pkgNpmPath: localNpm?.pkg ?? defaults.npm,
  })

  const localNpx = localCmdPath('npx', data, options)
  Object.assign(values, {
    rootNpxPath: localNpx?.root ?? defaults.npx,
    pkgNpxPath: localNpx?.pkg ?? defaults.npx,
  })

  let ciVersions = data.ciVersions
  let ciEngines = null

  if (ciVersions) {
    if (ciVersions === 'latest') {
      const defaultVersions = parentData.find(c => Array.isArray(c.ciVersions))
      if (defaultVersions) {
        ciVersions = defaultVersions.ciVersions.slice(-1)
      }
    }

    const { targets, engines } = parseCIVersions(ciVersions)
    ciEngines = engines

    // get just a list of the target versions (not ranges)
    // these are used for the node version when doing engines checks
    // since we want to test in the lowest version of each major
    let targetVersions = targets.filter(t => semver.valid(t))
    // if the versions are all ranges then convert them to the lower bound of each range
    if (!targetVersions.length) {
      targetVersions = targets.filter(t => semver.validRange(t)).map(t =>
        new semver.Range(t).set[0][0].semver.version)
    }

    values.ciVersions = targets
    values.baseCiVersions = targetVersions
  }

  if (ciEngines || data.engines) {
    values.engines = data.engines || ciEngines
  }

  return values
}

module.exports = {
  data: defaults,
  postData,
}
