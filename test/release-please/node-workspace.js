const t = require('tap')
// silence all logs during tests from release-please. this needs to come before
// the rest of the release-please requires to avoid a require cycle.
require('release-please').setLogger({
  error () {},
  warn () {},
  info () {},
  debug () {},
  trace () {},
})
const { Node } = require('release-please/build/src/strategies/node')
const { Version } = require('release-please/build/src/version')
const { TagName } = require('release-please/build/src/util/tag-name')
const NodeWorkspace = require('../../lib/release/node-workspace')
const Changelog = require('../../lib/release/changelog')

const mockGitHub = ({ names, versions, paths }) => ({
  repository: { owner: 'npm', repo: 'cli' },
  graphql: () => ({
    repository: {},
  }),
  octokit: {
    rest: {
      repos: {
        listPullRequestsAssociatedWithCommit: async () => {},
      },
    },
  },
  getFileContentsOnBranch: (file) => {
    const path = file.replace(/\/?package.json$/, '') || '.'
    const dependencies = path === '.' ? paths.filter(p => p !== '.').reduce((acc, ws) => {
      acc[names[ws]] = `^${versions[ws]}`
      return acc
    }, {}) : {}
    return {
      parsedContent: JSON.stringify({
        name: names[path],
        version: versions[path].toString(),
        dependencies,
      }),
    }
  },
})

const mockNodeWorkspace = async (workspaceNames = ['a']) => {
  const names = { '.': 'npm' }
  const versions = { '.': new Version(1, 1, 1) }

  for (const ws of workspaceNames) {
    names[`workspaces/${ws}`] = `@npmcli/${ws}`
    versions[`workspaces/${ws}`] = new Version(2, 2, 2)
  }

  const paths = Object.keys(names)
  const github = mockGitHub({ names, versions, paths })

  const workspaces = (fn) => paths.reduce((acc, p) => {
    acc[p] = fn(p)
    return acc
  }, {})

  return {
    workspaces,
    github,
    versions,
    paths,
    plugin: new NodeWorkspace(github, 'latest', workspaces(() => ({ releaseType: 'node' }))),
  }
}

const mockPullRequests = async (workspace, updates = workspace.paths) => {
  const { workspaces, plugin, github, versions } = workspace

  const strategiesByPath = workspaces((path) => new Node({
    github,
    path,
    changelogSections: [
      { type: 'deps', section: 'Dependencies' },
      { type: 'fix', section: 'Fixes' },
    ],
    changelogNotes: new Changelog(github),
  }))

  const commitsByPath = workspaces((path) => updates.includes(path) ? [{
    sha: '123',
    message: 'fix: stuff',
    files: ['package.json'],
  }] : [])

  const releaseByPath = workspaces((p) => ({
    sha: '',
    notes: '',
    tag: new TagName(versions[p], '', '-', true),
  }))

  await plugin.preconfigure(strategiesByPath, commitsByPath, releaseByPath)

  const candidatePullRequests = []
  for (const [path, strategy] of Object.entries(strategiesByPath)) {
    const pullRequest = await strategy.buildReleasePullRequest(
      commitsByPath[path],
      releaseByPath[path]
    )
    if (pullRequest?.version) {
      candidatePullRequests.push({
        path,
        pullRequest,
        config: {
          releaseType: 'node',
        },
      })
    }
  }

  const result = await plugin.run(candidatePullRequests)
  return result[0].pullRequest
}

t.test('root and ws fixes', async t => {
  const workspace = await mockNodeWorkspace()
  const pullRequest = await mockPullRequests(workspace)
  const pkgs = pullRequest.updates
    .filter(u => u.updater.rawContent)
    .map(u => JSON.parse(u.updater.rawContent))

  t.match(
    pullRequest.body.releaseData[0].notes,
    '[Workspace](https://github.com/npm/cli/releases/tag/a-v2.2.3)',
    'contains release link for workspace'
  )

  t.strictSame(pkgs, [
    {
      name: '@npmcli/a',
      version: '2.2.3',
      dependencies: {},
    },
    {
      name: 'npm',
      version: '1.1.2',
      dependencies: { '@npmcli/a': '^2.2.3' },
    },
  ])
})

t.test('root only', async t => {
  const workspace = await mockNodeWorkspace()
  const pullRequest = await mockPullRequests(workspace, ['.'])
  const pkgs = pullRequest.updates
    .filter(u => u.updater.rawContent)
    .map(u => JSON.parse(u.updater.rawContent))

  t.strictSame(pkgs, [
    {
      name: 'npm',
      version: '1.1.2',
      dependencies: { '@npmcli/a': '^2.2.2' },
    },
  ])
})

t.test('ws only', async t => {
  const workspace = await mockNodeWorkspace()
  const pullRequest = await mockPullRequests(workspace, ['workspaces/a'])
  const pkgs = pullRequest.updates
    .filter(u => u.updater.rawContent)
    .map(u => JSON.parse(u.updater.rawContent))

  t.strictSame(pkgs, [
    {
      name: '@npmcli/a',
      version: '2.2.3',
      dependencies: {},
    },
    {
      name: 'npm',
      version: '1.1.2',
      dependencies: { '@npmcli/a': '^2.2.3' },
    },
  ])
})

t.test('orders root to top', async t => {
  const ws1 = await mockNodeWorkspace(['a', 'b', 'c', 'd', 'e', 'f'])
  const [rootWs1] = ws1.paths.splice(0, 1)
  ws1.paths.push(rootWs1)
  const pr1 = await mockPullRequests(ws1)
  t.equal(pr1.body.releaseData[0].component, 'npm')

  const ws2 = await mockNodeWorkspace(['a', '123', 'bb', 'bbb', 'bbbe', 'aaaa'])
  const [rootWs2] = ws2.paths.splice(0, 1)
  ws2.paths.splice(4, 0, rootWs2)
  const pr2 = await mockPullRequests(ws2)
  t.equal(pr2.body.releaseData[0].component, 'npm')
})

t.test('stubbed errors', async t => {
  const { plugin } = await mockNodeWorkspace()
  t.throws(() => plugin.newCandidate())
  t.throws(() => plugin.bumpVersion())
})
