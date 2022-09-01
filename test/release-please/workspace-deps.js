const t = require('tap')
const WorkspaceDeps = require('../../lib/release-please/workspace-deps.js')
const { Changelog } = require('release-please/build/src/updaters/changelog.js')
const { PackageJson } = require('release-please/build/src/updaters/node/package-json.js')
const { TagName } = require('release-please/build/src/util/tag-name.js')
const { Version } = require('release-please/build/src/version.js')

const mockWorkspaceDeps = (notes) => {
  const releases = [{
    component: '',
    notes: notes.join('\n'),
  }, {
    component: 'pkg2',
    notes: '### no link',
    tag: new TagName(new Version(2, 0, 0), 'pkg2'),
  }, {
    component: 'pkg1',
    notes: '### [sdsfsdf](http://url1)',
    tag: new TagName(new Version(2, 0, 0), 'pkg1'),
  }, {
    component: 'pkg3',
    notes: '### [sdsfsdf](http://url3)',
    tag: new TagName(new Version(2, 0, 0), 'pkg3'),
  }]

  const options = { github: { repository: { owner: 'npm', repo: 'cli' } } }

  const pullRequests = new WorkspaceDeps(options.github).run([{
    pullRequest: {
      body: {
        releaseData: releases,
      },
      updates: [
        ...releases.map(r => ({
          path: `${r.component ? `${r.component}/` : ''}CHANGELOG.md`,
          updater: new Changelog({ changelogEntry: notes.join('\n') }),
        })),
        ...releases.map(r => {
          const pkg = new PackageJson({ version: '1.0.0' })
          pkg.rawContent = JSON.stringify({
            name: r.component === 'pkg1' ? '@scope/pkg1' : (r.component || 'root'),
          })
          return {
            path: `${r.component ? `${r.component}/` : ''}package.json`,
            updater: pkg,
          }
        }),
      ],
    },
  }])
  return {
    pr: pullRequests[0].pullRequest.body.releaseData[0].notes.split('\n'),
    changelog: pullRequests[0].pullRequest.updates[0].updater.changelogEntry.split('\n'),
  }
}

const fixtures = {
  wsDeps: [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Dependencies',
    '',
    '* The following workspace dependencies were updated',
    '  * peerDependencies',
    '    * pkgA bumped from ^1.0.0 to ^2.0.0',
    '    * pkgB bumped from ^1.0.0 to ^2.0.0',
    '  * dependencies',
    '    * @scope/pkg1 bumped from ^1.0.0 to ^2.0.0',
    '    * pkg2 bumped from ^1.0.0 to ^2.0.0',
    '    * pkg3 bumped from ^1.0.0 to ^2.0.0',
    '  * devDependencies',
    '    * pkgC bumped from ^1.0.0 to ^2.0.0',
    '    * pkgD bumped from ^1.0.0 to ^2.0.0',
    '',
    '### Next',
    '',
    '  * xyz',
  ],
  empty: [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Dependencies',
    '',
    '* The following workspace dependencies were updated',
    '  * peerDependencies',
    '    * pkgA bumped from ^1.0.0 to ^2.0.0',
    '    * pkgB bumped from ^1.0.0 to ^2.0.0',
    '  * devDependencies',
    '    * pkgC bumped from ^1.0.0 to ^2.0.0',
    '    * pkgD bumped from ^1.0.0 to ^2.0.0',
    '',
    '### Other',
    '',
    '  * xyz',
  ],
}

t.test('rewrite deps', async (t) => {
  const mockWs = mockWorkspaceDeps(fixtures.wsDeps)
  t.strictSame(mockWs.pr, [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Dependencies',
    '',
    '  * deps: [`@scope/pkg1@^2.0.0`](https://github.com/npm/cli/releases/tag/pkg1-v2.0.0)',
    '  * deps: [`pkg2@^2.0.0`](https://github.com/npm/cli/releases/tag/pkg2-v2.0.0)',
    '  * deps: [`pkg3@^2.0.0`](https://github.com/npm/cli/releases/tag/pkg3-v2.0.0)',
    '',
    '### Next',
    '',
    '  * xyz',
  ])
  t.strictSame(mockWs.pr, mockWs.changelog)

  const mockEmpty = mockWorkspaceDeps(fixtures.empty)
  t.strictSame(mockEmpty.pr, [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Other',
    '',
    '  * xyz',
  ])
  t.strictSame(mockEmpty.pr, mockEmpty.changelog)
})
