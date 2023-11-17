const t = require('tap')
const Version = require('../../lib/release/version.js')

const COMMITS = {
  major: [{ type: 'feat' }, {}, {}, { breaking: true }],
  minor: [{}, {}, { type: 'feat' }],
  patch: [{}, { type: 'chore' }, { type: 'fix' }],
}

const COMMIT_NAME = (c) => Object.entries(COMMITS).find(([, i]) => i === c)[0]

t.test('bumps', async (t) => {
  const checks = [
    // Normal releases
    ['2.0.0', COMMITS.major, false, '3.0.0'],
    ['2.0.0', COMMITS.minor, false, '2.1.0'],
    ['2.0.0', COMMITS.patch, false, '2.0.1'],
    // premajor -> normal
    ['2.0.0-pre.1', COMMITS.major, false, '2.0.0'],
    ['2.0.0-pre.5', COMMITS.minor, false, '2.0.0'],
    ['2.0.0-pre.4', COMMITS.patch, false, '2.0.0'],
    // preminor -> normal
    ['2.1.0-pre.1', COMMITS.major, false, '3.0.0'],
    ['2.1.0-pre.5', COMMITS.minor, false, '2.1.0'],
    ['2.1.0-pre.4', COMMITS.patch, false, '2.1.0'],
    // prepatch -> normal
    ['2.0.1-pre.1', COMMITS.major, false, '3.0.0'],
    ['2.0.1-pre.5', COMMITS.minor, false, '2.1.0'],
    ['2.0.1-pre.4', COMMITS.patch, false, '2.0.1'],
    // Prereleases
    ['2.0.0', COMMITS.major, true, '3.0.0-pre.0'],
    ['2.0.0', COMMITS.minor, true, '2.1.0-pre.0'],
    ['2.0.0', COMMITS.patch, true, '2.0.1-pre.0'],
    // premajor - prereleases
    ['2.0.0-pre.1', COMMITS.major, true, '2.0.0-pre.2'],
    ['2.0.0-pre.1', COMMITS.minor, true, '2.0.0-pre.2'],
    ['2.0.0-pre.1', COMMITS.patch, true, '2.0.0-pre.2'],
    // preminor - prereleases
    ['2.1.0-pre.1', COMMITS.major, true, '3.0.0-pre.0'],
    ['2.1.0-pre.1', COMMITS.minor, true, '2.1.0-pre.2'],
    ['2.1.0-pre.1', COMMITS.patch, true, '2.1.0-pre.2'],
    // prepatch - prereleases
    ['2.0.1-pre.1', COMMITS.major, true, '3.0.0-pre.0'],
    ['2.0.1-pre.1', COMMITS.minor, true, '2.1.0-pre.0'],
    ['2.0.1-pre.1', COMMITS.patch, true, '2.0.1-pre.2'],
    // different prerelease identifiers
    ['2.0.0-beta.1', COMMITS.major, true, '2.0.0-beta.2'],
    ['2.0.0-alpha.1', COMMITS.major, true, '2.0.0-alpha.2'],
    ['2.0.0-rc.1', COMMITS.major, true, '2.0.0-rc.2'],
    ['2.0.0-0', COMMITS.major, true, '2.0.0-1'],
  ]

  for (const [version, commits, prerelease, expected] of checks) {
    const name = [version, COMMIT_NAME(commits), prerelease ? 'pre' : 'normal', expected]
    const r = new Version(null, { prerelease }).bump(version, commits)
    t.equal(
      `${r.major}.${r.minor}.${r.patch}${r.preRelease ? `-${r.preRelease}` : ''}`,
      expected,
      name.join(' - ')
    )
  }
})
