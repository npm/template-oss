const t = require('tap')
const ChangelogNotes = require('../../lib/release/changelog.js')

const mockGitHub = ({ commits, authors, refs, releases }) => ({
  repository: { owner: 'npm', repo: 'cli' },
  graphql: () => ({
    repository: commits.reduce((acc, c, i) => {
      if (c.sha) {
        if (c.sha === 'd' || c.type === 'deps') {
          // simulate a bad sha passed in that doesnt return a commit
          acc[`_${c.sha}`] = null
        } else {
          const author = i % 2 ? { user: { login: 'username' } } : { name: 'Name' }
          acc[`_${c.sha}`] = { authors: { nodes: authors ? [author] : [] } }
        }
      }
      return acc
    }, {}),
  }),
  octokit: {
    rest: {
      repos: {
        listPullRequestsAssociatedWithCommit: async commit => {
          if (commit.commit_sha === 'd') {
            return {
              data: [
                {
                  number: 50,
                },
              ],
            }
          }
        },
        getReleaseByTag: async ({ tag }) => {
          if (releases && Object.prototype.hasOwnProperty.call(releases, tag)) {
            const value = releases[tag]
            if (value === null) {
              const err = new Error(`Not Found: ${tag}`)
              err.status = 404
              throw err
            }
            return { data: { body: value } }
          }
          const err = new Error(`Not Found: ${tag}`)
          err.status = 404
          throw err
        },
      },
      git: {
        listMatchingRefs: async ({ ref }) => ({
          data: (refs ?? [])
            .filter(r => r.startsWith(ref.replace(/^tags\//, '')))
            .map(name => ({ ref: `refs/tags/${name}` })),
        }),
      },
    },
  },
})

const mockChangelog = async ({
  shas = true,
  authors = true,
  previousTag = 'v0.1.0',
  currentTag = 'v1.0.0',
  version = '1.0.0',
  refs,
  releases,
  commits: rawCommits = [
    {
      sha: 'a',
      type: 'feat',
      bareMessage: 'Hey now',
      scope: 'bin',
    },
    {
      sha: 'b',
      type: 'feat',
      notes: [{ title: 'BREAKING CHANGE', text: 'breaking' }],
      bareMessage: 'b',
      pullRequest: {
        number: '100',
      },
    },
    {
      sha: 'c',
      type: 'deps',
      bareMessage: 'test@1.2.3',
    },
    {
      sha: 'd',
      type: 'fix',
      bareMessage: 'this fixes it',
    },
  ],
} = {}) => {
  const commits = rawCommits
    .map(({ notes = [], ...rest }) => ({ notes, ...rest }))
    .map(({ sha, ...rest }) => (shas ? { sha, ...rest } : { ...rest }))

  const github = mockGitHub({ commits, authors, refs, releases })
  const changelog = new ChangelogNotes(github)

  const notes = await changelog.buildNotes(commits, {
    version,
    previousTag,
    currentTag,
    changelogSections: require('../../release-please-config.json')['changelog-sections'],
  })

  return notes
    .split('\n')
    .map(l => l.replace(/\d{4}-\d{2}-\d{2}/g, 'DATE'))
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
  const changelog = await mockChangelog({ authors: false, previousTag: null, shas: false })
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
    commits: [
      {
        sha: 'z',
        type: 'fix',
        bareMessage: 'just a fix',
      },
      {
        sha: 'a',
        type: 'chore',
        bareMessage: 'postinstall for dependabot template-oss PR',
        pullRequest: {
          number: '100',
        },
      },
      {
        sha: 'b',
        type: 'chore',
        bareMessage: 'postinstall for dependabot template-oss PR',
        pullRequest: {
          number: '101',
        },
      },
      {
        sha: 'c',
        type: 'chore',
        bareMessage: 'bump @npmcli/template-oss from 1 to 2',
        pullRequest: {
          number: '101',
        },
      },
      {
        sha: 'd',
        type: 'chore',
        bareMessage: 'bump @npmcli/template-oss from 0 to 1',
        pullRequest: {
          number: '100',
        },
      },
    ],
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
    commits: [
      {
        sha: 'a',
        type: 'chore',
        bareMessage: 'some chore',
      },
      {
        sha: 'a',
        type: 'chore',
        bareMessage: 'another chore',
      },
    ],
  })
  t.strictSame(changelog, [])
})

t.test('exiting prerelease aggregates breaking notes from prereleases', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.2',
    currentTag: 'v12.0.0',
    version: '12.0.0',
    refs: ['v12.0.0-pre.0', 'v12.0.0-pre.1', 'v12.0.0-pre.2'],
    releases: {
      'v12.0.0-pre.0': [
        '## [12.0.0-pre.0] (DATE)',
        '### ⚠️ BREAKING CHANGES',
        '* drops support for node 18',
        '* renames the foo flag to bar',
        '### Features',
        '* [`xxx`](url) some feat',
      ].join('\n'),
      'v12.0.0-pre.1': [
        '## [12.0.0-pre.1] (DATE)',
        '### ⚠️ BREAKING CHANGES',
        '* removes the deprecated baz API',
        '* drops support for node 18',
        '### Bug Fixes',
        '* [`yyy`](url) some fix',
      ].join('\n'),
      'v12.0.0-pre.2': ['## [12.0.0-pre.2] (DATE)', '### Bug Fixes', '* [`zzz`](url) another fix'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'post-prerelease feat',
        notes: [{ title: 'BREAKING CHANGE', text: 'final breaking note' }],
      },
      {
        sha: 'b',
        type: 'feat',
        bareMessage: 'a feat that duplicates an existing breaking note',
        notes: [{ title: 'BREAKING CHANGE', text: 'drops support for node 18' }],
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.0](https://github.com/npm/cli/compare/v12.0.0-pre.2...v12.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* drops support for node 18',
    '* renames the foo flag to bar',
    '* removes the deprecated baz API',
    '* final breaking note',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) post-prerelease feat',
    '* [`b`](https://github.com/npm/cli/commit/b) a feat that duplicates an existing breaking note',
  ])
})

t.test('still in prerelease does not aggregate', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.1',
    currentTag: 'v12.0.0-pre.2',
    version: '12.0.0-pre.2',
    refs: ['v12.0.0-pre.0', 'v12.0.0-pre.1'],
    releases: {
      'v12.0.0-pre.0': ['## [12.0.0-pre.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* should not appear'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'some feat',
        notes: [{ title: 'BREAKING CHANGE', text: 'real breaking note' }],
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.0-pre.2](https://github.com/npm/cli/compare/v12.0.0-pre.1...v12.0.0-pre.2) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* real breaking note',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) some feat',
  ])
})

t.test('non-prerelease previousTag does not aggregate', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v11.5.2',
    currentTag: 'v11.5.3',
    version: '11.5.3',
    refs: ['v11.5.3-pre.0'],
    releases: {
      'v11.5.3-pre.0': ['## [11.5.3-pre.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* should not appear'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'fix',
        bareMessage: 'a fix',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [11.5.3](https://github.com/npm/cli/compare/v11.5.2...v11.5.3) (DATE)',
    '### Bug Fixes',
    '* [`a`](https://github.com/npm/cli/commit/a) a fix',
  ])
})

t.test('different X.Y.Z between previous prerelease and current does not aggregate', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.3',
    currentTag: 'v12.0.1',
    version: '12.0.1',
    refs: ['v12.0.0-pre.0', 'v12.0.0-pre.3'],
    releases: {
      'v12.0.0-pre.0': ['## [12.0.0-pre.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* should not appear'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'fix',
        bareMessage: 'a fix',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.1](https://github.com/npm/cli/compare/v12.0.0-pre.3...v12.0.1) (DATE)',
    '### Bug Fixes',
    '* [`a`](https://github.com/npm/cli/commit/a) a fix',
  ])
})

t.test('workspace tag aggregates with component prefix', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'arborist-v12.0.0-pre.1',
    currentTag: 'arborist-v12.0.0',
    version: '12.0.0',
    refs: [
      // Same X.Y.Z but different workspace - must not be included
      'libnpmaccess-v12.0.0-pre.0',
      // Different X.Y.Z prereleases for the right workspace - must not be included
      'arborist-v11.5.0-pre.0',
      // Correct prereleases for this workspace and version
      'arborist-v12.0.0-pre.0',
      'arborist-v12.0.0-pre.1',
    ],
    releases: {
      'arborist-v12.0.0-pre.0': [
        '## [12.0.0-pre.0] (DATE)',
        '### ⚠️ BREAKING CHANGES',
        '* arborist drops legacy api',
      ].join('\n'),
      'arborist-v12.0.0-pre.1': [
        '## [12.0.0-pre.1] (DATE)',
        '### ⚠️ BREAKING CHANGES',
        '* renames arborist option foo to bar',
      ].join('\n'),
      'libnpmaccess-v12.0.0-pre.0': [
        '## [12.0.0-pre.0] (DATE)',
        '### ⚠️ BREAKING CHANGES',
        '* wrong workspace, must not appear',
      ].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'final feat for arborist',
      },
    ],
  })
  t.strictSame(changelog, [
    // eslint-disable-next-line max-len
    '## [12.0.0](https://github.com/npm/cli/compare/arborist-v12.0.0-pre.1...arborist-v12.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* arborist drops legacy api',
    '* renames arborist option foo to bar',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) final feat for arborist',
  ])
})

t.test('missing release for a prerelease tag is skipped', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.1',
    currentTag: 'v12.0.0',
    version: '12.0.0',
    refs: ['v12.0.0-pre.0', 'v12.0.0-pre.1'],
    releases: {
      // pre.0 release was deleted
      'v12.0.0-pre.0': null,
      'v12.0.0-pre.1': ['## [12.0.0-pre.1] (DATE)', '### ⚠️ BREAKING CHANGES', '* renames foo to bar'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'final feat',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.0](https://github.com/npm/cli/compare/v12.0.0-pre.1...v12.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* renames foo to bar',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) final feat',
  ])
})

t.test('non-404 errors from getReleaseByTag are surfaced', async t => {
  const boom = new Error('boom')
  boom.status = 500
  const github = {
    repository: { owner: 'npm', repo: 'cli' },
    graphql: () => ({ repository: {} }),
    octokit: {
      rest: {
        repos: {
          listPullRequestsAssociatedWithCommit: async () => ({ data: [] }),
          getReleaseByTag: async () => {
            throw boom
          },
        },
        git: {
          listMatchingRefs: async () => ({
            data: [{ ref: 'refs/tags/v12.0.0-pre.0' }],
          }),
        },
      },
    },
  }
  const changelog = new ChangelogNotes(github)
  await t.rejects(
    changelog.buildNotes([], {
      version: '12.0.0',
      previousTag: 'v12.0.0-pre.0',
      currentTag: 'v12.0.0',
      changelogSections: require('../../release-please-config.json')['changelog-sections'],
    }),
    /boom/,
  )
})

t.test('different prerelease identifier is filtered out', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.1',
    currentTag: 'v12.0.0',
    version: '12.0.0',
    refs: [
      'v12.0.0-pre.0',
      'v12.0.0-pre.1',
      // unrelated lineage that happens to share base version
      'v12.0.0-rc.0',
    ],
    releases: {
      'v12.0.0-pre.0': ['## [12.0.0-pre.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* expected note'].join('\n'),
      'v12.0.0-rc.0': ['## [12.0.0-rc.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* must not appear'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'final feat',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.0](https://github.com/npm/cli/compare/v12.0.0-pre.1...v12.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* expected note',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) final feat',
  ])
})

t.test('empty release body for a prerelease tag is skipped without crash', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'v12.0.0-pre.1',
    currentTag: 'v12.0.0',
    version: '12.0.0',
    refs: ['v12.0.0-pre.0', 'v12.0.0-pre.1'],
    releases: {
      'v12.0.0-pre.0': '',
      'v12.0.0-pre.1': ['## [12.0.0-pre.1] (DATE)', '### ⚠️ BREAKING CHANGES', '* renames foo to bar'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'feat',
        bareMessage: 'final feat',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [12.0.0](https://github.com/npm/cli/compare/v12.0.0-pre.1...v12.0.0) (DATE)',
    '### ⚠️ BREAKING CHANGES',
    '* renames foo to bar',
    '### Features',
    '* [`a`](https://github.com/npm/cli/commit/a) final feat',
  ])
})

t.test('unparseable tag input is treated as no aggregation', async t => {
  const changelog = await mockChangelog({
    authors: false,
    previousTag: 'not-a-real-tag',
    currentTag: 'also-not-a-tag',
    version: '1.0.0',
    refs: ['v1.0.0-pre.0'],
    releases: {
      'v1.0.0-pre.0': ['## [1.0.0-pre.0] (DATE)', '### ⚠️ BREAKING CHANGES', '* must not appear'].join('\n'),
    },
    commits: [
      {
        sha: 'a',
        type: 'fix',
        bareMessage: 'a fix',
      },
    ],
  })
  t.strictSame(changelog, [
    '## [1.0.0](https://github.com/npm/cli/compare/not-a-real-tag...also-not-a-tag) (DATE)',
    '### Bug Fixes',
    '* [`a`](https://github.com/npm/cli/commit/a) a fix',
  ])
})
