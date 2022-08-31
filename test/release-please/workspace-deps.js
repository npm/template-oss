const t = require('tap')
const WorkspaceDeps = require('../../lib/release-please/workspace-deps.js')

const mockWorkspaceDeps = (notes) => {
  const pullRequests = new WorkspaceDeps().run([{
    pullRequest: {
      body: {
        releaseData: [{
          component: '',
          notes: notes.join('\n'),
        }, {
          component: 'pkg2',
          notes: '### no link',
        }, {
          component: 'pkg1',
          notes: '### [sdsfsdf](http://url1)',
        }],
      },
    },
  }])
  return pullRequests[0].pullRequest.body.releaseData[0].notes.split('\n')
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
    '    * pkg1 bumped from ^1.0.0 to ^2.0.0',
    '    * pkg2 bumped from ^1.0.0 to ^2.0.0',
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
  t.strictSame(mockWorkspaceDeps(fixtures.wsDeps), [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Dependencies',
    '',
    '  * [`pkg1@^2.0.0`](http://url1)',
    '  * `pkg2@^2.0.0`',
    '',
    '### Next',
    '',
    '  * xyz',
  ])

  t.strictSame(mockWorkspaceDeps(fixtures.empty), [
    '### Feat',
    '',
    '  * xyz',
    '',
    '### Other',
    '',
    '  * xyz',
  ])
})
