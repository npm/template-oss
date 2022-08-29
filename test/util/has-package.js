const fs = require('@npmcli/fs')
const t = require('tap')
const path = require('path')
const hasPackage = require('../../lib/util/has-package.js')
const { name: NAME } = require('../../package.json')

const checks = [
  [{ a: '1.2.3' }, 'a@1.2.3', true],
  [{ a: '1.2.3' }, 'a@1.2.4', false],
  [{ a: '1.2.3' }, 'b@1.2.3', false],
  [{ a: '1.2.3' }, 'a@1.2.3', ['devDependencies'], false],
  [{ a: '1.2.3' }, 'a@^1.2.3', true],
  [{ a: '1.2.3' }, 'a@^1.2.4', false],
  [{ a: '' }, 'a', true],
  [{ a: '*' }, 'a', true],
  [{ a: '*' }, 'a@*', true],
  [{ a: '^1.0.0' }, 'a', true],
  [{ a: '^1.0.0' }, 'a@^1', true],
  [{ a: '^1' }, 'a@^1', true],
  [{ a: '^5.0.0' }, 'a@>=4', true],
  [{ a: '^1.0.0' }, 'a@^1.5.0', false],
  [{ a: '^1.0.0' }, 'a@1.5.0', false],
  [{ a: 'npm/cli#abc' }, 'a', false],
  [{ [NAME]: 'npm/cli#abc' }, NAME, true],
  [{ a: 'https://test.com/npm/cli.tgz' }, 'a', false],
  [{ a: '^1.0.0' }, 'a@sometag', false],
]

checks.forEach((args) => {
  const res = args.pop()
  const [pkg, spec, ...rest] = args
  t.equal(hasPackage({ dependencies: pkg }, spec, ...rest), res, `${JSON.stringify(pkg)}-${spec}`)
})

t.test('works with file urls', async (t) => {
  const root = t.testdir({
    nested: {
      'package.json': JSON.stringify({
        name: 'root',
        dependencies: {
          a: 'file:../workspace/packagea',
        },
      }),
    },
    workspace: {
      packagea: {
        'package.json': JSON.stringify({
          name: 'a',
          version: '5.0.1',
        }),
      },

    },
  })

  const pkgPath = path.join(root, 'nested')
  const p = JSON.parse(await fs.readFile(path.join(pkgPath, 'package.json'), 'utf-8'))

  t.ok(hasPackage(p, 'a@5.0.1', undefined, pkgPath))
  t.ok(hasPackage(p, 'a@5', undefined, pkgPath))
  t.notOk(hasPackage(p, 'a@5.0.2', undefined, pkgPath))
  t.notOk(hasPackage(p, 'a@5.0.0', undefined, pkgPath))
})
