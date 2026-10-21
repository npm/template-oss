const t = require('tap')
const RP = require('release-please')

const cases = [
  {
    name: 'infer a maintenance branch without a backport argument',
    branch: 'release/v21',
    version: '21.5.2',
    tag: 'latest-21',
  },
  {
    name: 'infer a maintenance branch with an empty backport argument',
    branch: 'release/v19',
    backport: '',
    version: '19.0.3',
    tag: 'latest-19',
  },
  {
    name: 'preserve an explicit backport override',
    branch: 'release/v21',
    backport: '6',
    version: '21.5.2',
    tag: 'latest-6',
  },
  {
    name: 'support explicit backports on custom branch names',
    branch: 'maintenance',
    backport: '9',
    version: '9.0.2',
    tag: 'latest-9',
  },
  {
    name: 'keep the default branch on latest',
    branch: 'main',
    backport: '',
    version: '22.0.2',
    tag: 'latest',
  },
  {
    name: 'preserve the configured default tag',
    branch: 'main',
    defaultTag: 'latest-{{major}}',
    version: '22.0.2',
    tag: 'latest-22',
  },
  {
    name: 'do not infer nonstandard maintenance branch names',
    branch: 'release/v21-preview',
    backport: '',
    version: '21.5.2',
    tag: 'latest',
  },
  {
    name: 'keep prerelease tags based on the package version',
    branch: 'release/v21',
    version: '21.5.2-pre.0',
    tag: 'prerelease-21',
  },
  {
    name: 'apply the maintenance line to root and workspace releases',
    branch: 'release/v21',
    version: '21.5.2',
    workspace: true,
    tag: 'latest-21',
  },
]

for (const { name, branch, backport, defaultTag = 'latest', version, workspace, tag } of cases) {
  t.test(name, async t => {
    const releases = [{ path: '.', version, sha: 'root-sha' }]
    if (workspace) {
      releases.push({ path: 'packages/child', version: '3.2.1', sha: 'child-sha' })
    }
    const github = {
      octokit: {
        rest: {
          repos: {
            listPullRequestsAssociatedWithCommit: async () => ({ data: [{ number: 1 }] }),
            getContent: async ({ ref }) => {
              t.equal(ref, branch, 'read the manifest from the release branch')
              return {
                data: {
                  content: Buffer.from(JSON.stringify({ name: 'test-package' })).toString('base64'),
                  encoding: 'base64',
                },
              }
            },
          },
        },
      },
    }
    const ReleasePlease = t.mockRequire('../../lib/release/release-please.js', {
      'release-please': {
        ...RP,
        registerChangelogNotes: () => {},
        registerVersioningStrategy: () => {},
        registerPlugin: () => {},
        setLogger: () => {},
        GitHub: { create: async () => github },
        Manifest: {
          fromManifest: async (_github, targetBranch) => {
            t.equal(targetBranch, branch, 'target the requested branch')
            return {
              createPullRequests: async () => [],
              createReleases: async () => releases,
            }
          },
        },
      },
    })
    const result = await ReleasePlease.run({
      token: 'test-token',
      repo: 'test/repo',
      branch,
      backport,
      defaultTag,
      silent: true,
    })
    t.equal(result.pr, null)
    t.same(
      result.releases.map(release => release.publishTag),
      releases.map(() => tag),
      'emit the correct tags for the automatic publisher',
    )
  })
}
