const t = require('tap')
const ChangelogNotes = require('../../lib/release-please/changelog.js')

const mockChangelog = async ({ shas = true, authors = true, previousTag = true } = {}) => {
  const commits = [{
    sha: 'a',
    type: 'feat',
    notes: [],
    bareMessage: 'Hey now',
    scope: 'bin',
  }, {
    sha: 'b',
    type: 'feat',
    notes: [{ title: 'BREAKING CHANGE', text: 'breaking' }],
    bareMessage: 'b',
    pullRequest: {
      number: '100',
    },
  }, {
    sha: 'c',
    type: 'deps',
    bareMessage: 'test@1.2.3',
    notes: [],
  }, {
    sha: 'd',
    type: 'fix',
    bareMessage: 'this fixes it',
    notes: [],
  }].map(({ sha, ...rest }) => shas ? { sha, ...rest } : rest)

  const github = {
    repository: { owner: 'npm', repo: 'cli' },
    graphql: () => ({
      repository: commits.reduce((acc, c, i) => {
        if (c.sha) {
          if (c.sha === 'd') {
            // simulate a bad sha passed in that doesnt return a commit
            acc[`_${c.sha}`] = null
          } else {
            const author = i % 2
              ? { user: { login: 'username' } }
              : { name: 'Name' }
            acc[`_${c.sha}`] = { authors: { nodes: authors ? [author] : [] } }
          }
        }
        return acc
      }, {}),
    }),
    octokit: {
      rest: {
        repos: {
          listPullRequestsAssociatedWithCommit: async (commit) => {
            if (commit.commit_sha === 'd') {
              return {
                data: [{
                  number: 50,
                }],
              }
            }
          },
        },
      },
    },
  }

  const changelog = new ChangelogNotes({ github })

  const notes = await changelog.buildNotes(commits, {
    version: '1.0.0',
    previousTag: previousTag ? 'v0.1.0' : null,
    currentTag: 'v1.0.0',
    changelogSections: require('../../release-please-config.json')['changelog-sections'],
  })

  return notes
    .split('\n')
    .map((l) => l.replace(/\d{4}-\d{2}-\d{2}/g, 'DATE'))
    .filter(Boolean)
}

t.test('changelog', async t => {
  const changelog = await mockChangelog()
  t.strictSame(changelog, [
    '## [1.0.0](https://github.com/npm/cli/compare/v0.1.0...v1.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* breaking',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) bin: Hey now (Name)',
    // eslint-disable-next-line max-len
    '* [`b`](https://github.com/npm/cli/commit/b) [#100](https://github.com/npm/cli/pull/100) b (@username)',
    '### Bug Fixes',
    // eslint-disable-next-line max-len
    '* [`d`](https://github.com/npm/cli/commit/d) [#50](https://github.com/npm/cli/pull/50) this fixes it',
    '### Dependencies',
    '* [`c`](https://github.com/npm/cli/commit/c) `test@1.2.3`',
  ])
})

t.test('no tag/authors/shas', async t => {
  const changelog = await mockChangelog({ authors: false, previousTag: false, shas: false })
  t.strictSame(changelog, [
    '## 1.0.0 (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* breaking',
    '### Features',
    '* bin: Hey now',
    '* [#100](https://github.com/npm/cli/pull/100) b',
    '### Bug Fixes',
    '* this fixes it',
    '### Dependencies',
    '* `test@1.2.3`',
  ])
})
