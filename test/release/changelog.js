const t = require('tap')
const ChangelogNotes = require('../../lib/release/changelog.js')

const mockGitHub = ({ commits, authors }) => ({
  repository: { owner: 'npm', repo: 'cli' },
  graphql: () => ({
    repository: commits.reduce((acc, c, i) => {
      if (c.sha) {
        if (c.sha === 'd' || c.type === 'deps') {
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
})

const mockChangelog = async ({
  shas = true,
  authors = true,
  previousTag = true,
  commits: rawCommits = [{
    sha: 'a',
    type: 'feat',
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
  }, {
    sha: 'd',
    type: 'fix',
    bareMessage: 'this fixes it',
  }],
} = {}) => {
  const commits = rawCommits
    .map(({ notes = [], ...rest }) => ({ notes, ...rest }))
    .map(({ sha, ...rest }) => shas ? { sha, ...rest } : { ...rest })

  const github = mockGitHub({ commits, authors })
  const changelog = new ChangelogNotes(github)

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

t.test('filters out multiple template oss commits', async t => {
  const changelog = await mockChangelog({
    authors: false,
    commits: [{
      sha: 'z',
      type: 'fix',
      bareMessage: 'just a fix',
    }, {
      sha: 'a',
      type: 'chore',
      bareMessage: 'postinstall for dependabot template-oss PR',
      pullRequest: {
        number: '100',
      },
    }, {
      sha: 'b',
      type: 'chore',
      bareMessage: 'postinstall for dependabot template-oss PR',
      pullRequest: {
        number: '101',
      },
    }, {
      sha: 'c',
      type: 'chore',
      bareMessage: 'bump @npmcli/template-oss from 1 to 2',
      pullRequest: {
        number: '101',
      },
    }, {
      sha: 'd',
      type: 'chore',
      bareMessage: 'bump @npmcli/template-oss from 0 to 1',
      pullRequest: {
        number: '100',
      },
    }],
  })
  t.strictSame(changelog, [
    '## [1.0.0](https://github.com/npm/cli/compare/v0.1.0...v1.0.0) (DATE)',
    '### Bug Fixes',
    '* [`z`](https://github.com/npm/cli/commit/z) just a fix',
    '### Chores',
    // eslint-disable-next-line max-len
    '* [`b`](https://github.com/npm/cli/commit/b) [#101](https://github.com/npm/cli/pull/101) postinstall for dependabot template-oss PR',
    // eslint-disable-next-line max-len
    '* [`c`](https://github.com/npm/cli/commit/c) [#101](https://github.com/npm/cli/pull/101) bump @npmcli/template-oss from 1 to 2',
  ])
})

t.test('empty change log with only chore commits', async t => {
  const changelog = await mockChangelog({
    authors: false,
    commits: [{
      sha: 'a',
      type: 'chore',
      bareMessage: 'some chore',
    }, {
      sha: 'a',
      type: 'chore',
      bareMessage: 'another chore',
    }],
  })
  t.strictSame(changelog, [])
})
