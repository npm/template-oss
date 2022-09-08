const t = require('tap')
const { join, resolve, posix } = require('path')
const { merge, defaults, escapeRegExp: esc } = require('lodash')
const fs = require('@npmcli/fs')
const Git = require('@npmcli/git')
const localeCompare = require('@isaacs/string-locale-compare')('en')
const npa = require('npm-package-arg')
const output = require('../lib/util/output.js')
const apply = require('../lib/apply/index.js')
const check = require('../lib/check/index.js')
const CONTENT = require('..')
const { name: NAME, version: VERSION } = require('../package.json')

const createPackageJson = (pkg) => ({
  'package.json': JSON.stringify(pkg, null, 2),
})

const pkgWithName = (name, defName) => {
  const pkg = typeof name === 'string' ? { name } : name
  if (!pkg.name) {
    pkg.name = defName
  }
  if (!pkg.version) {
    pkg.version = '1.0.0'
  }
  return pkg
}

// minimum package.json for no errors
const okPackage = () => Object.entries(CONTENT.requiredPackages)
  .reduce((acc, [location, deps]) => {
    acc[location] = Object.fromEntries(deps.map((name) => {
      const arg = npa(name)
      return [arg.name, arg.fetchSpec === 'latest' ? '*' : arg.fetchSpec]
    }))
    return acc
  }, {
    tap: {
      'nyc-arg': [
        '--exclude',
        'tap-snapshots/**',
      ],
    },
  })

const setupRoot = async (root) => {
  const rootPath = (...p) => join(root, ...p)

  // fs methods for reading from the root
  const rootFs = Object.fromEntries(Object.entries({
    readdir: fs.readdir,
    readFile: (p) => fs.readFile(p, { encoding: 'utf-8' }),
    writeFile: (p, d) => fs.writeFile(p, d, { encoding: 'utf-8' }),
    appendFile: fs.appendFile,
    stat: fs.stat,
    unlink: fs.unlink,
  }).map(([k, fn]) => [k, (p, ...rest) => fn(rootPath(p), ...rest)]))

  // Returns a recurisve list of relative file
  // paths in the testdir root
  const readdir = async (p = '') => {
    const paths = []
    const rootRes = await rootFs.readdir(p)
    for (const source of rootRes) {
      const nextPath = join(p, source)
      if (nextPath === '.git') {
        continue
      }
      if ((await rootFs.stat(nextPath)).isDirectory()) {
        paths.push(...await readdir(nextPath))
      } else {
        paths.push(nextPath)
      }
    }
    return paths.sort()
  }

  // returns an object where the keys are relative file
  // paths and the values are the full contents
  const readdirSource = async (p = '') => {
    const files = await readdir(p)
    const contents = await Promise.all(files.map((f) => rootFs.readFile(f)))
    return Object.fromEntries(files.map((f, i) => [f, contents[i]]))
  }

  return {
    root,
    ...rootFs,
    readdirSource,
    readdir,
    readJson: async (f) => JSON.parse(await rootFs.readFile(f)),
    writeJson: (p, d) => rootFs.writeFile(p, JSON.stringify(d, null, 2)),
    join: rootPath,
    apply: () => apply(root),
    check: () => check(root),
    runAll: () => apply(root).then(() => check(root)),
  }
}

const setup = async (t, {
  package = {},
  workspaces = {},
  testdir = {},
  ok,
} = {}) => {
  const wsLookup = {}
  const pkg = merge(
    pkgWithName(package, 'testpkg'),
    ok ? okPackage() : {}
  )

  // convenience for passing in workspaces as an object
  // and getting those converted to a proper workspaces array
  // and adding the workspaces to the testdir
  if (Object.keys(workspaces).length) {
    const wsEntries = Object.entries(workspaces)
    const wsDir = 'workspaces'
    defaults(pkg, { workspaces: [] })
    merge(testdir, { [wsDir]: {} })

    for (const [wsBase, wsPkgName] of wsEntries) {
      const wsPkg = merge(
        pkgWithName(wsPkgName, wsBase),
        ok ? okPackage() : {}
      )
      const wsPath = posix.join(wsDir, wsBase)
      // obj to lookup workspaces by path in tests
      wsLookup[wsBase] = wsPath
      merge(testdir[wsDir], { [wsBase]: createPackageJson(wsPkg) })
      pkg.workspaces.push(wsPath)
    }
  }

  // creates dir with a root package.json and
  // package.json files for each workspace
  const root = t.testdir(merge(
    createPackageJson(pkg),
    testdir
  ))

  return {
    ...(await setupRoot(root)),
    workspaces: wsLookup,
  }
}

const setupGit = async (...args) => {
  const s = await setup(...args)
  const git = (arg) => Git.spawn(arg.split(' '), { cwd: s.root })

  const gca = async () => {
    await git('add -A .')
    await git('commit -m "init"')
  }

  await git('init')
  await git('remote add origin git@github.com:testuser/myrepo.git')
  await gca()

  return {
    ...s,
    git,
    gca,
  }
}

const cleanSnapshot = (str) => str
  .replace(/\\+/g, '/')
  .replace(/\r\n/g, '\n')
  .replace(new RegExp(`("version": "|${esc(NAME)}@)${esc(VERSION)}`, 'g'), '$1{{VERSION}}')
const formatSnapshots = {
  checks: (arr) => output(arr).trim(),
  readdir: (arr) => arr.sort(localeCompare).join('\n').trim(),
  readdirSource: (obj) => Object.entries(obj)
    .sort((a, b) => localeCompare(a[0], b[0]))
    .map(([file, content]) => [file, '='.repeat(40), content].join('\n').trim())
    .join('\n\n')
    .trim(),
}

module.exports = setup
module.exports.git = setupGit
module.exports.content = CONTENT
module.exports.pkgVersion = VERSION
module.exports.clean = cleanSnapshot
module.exports.format = formatSnapshots
module.exports.okPackage = okPackage
module.exports.fixture = (f) => fs.readFile(resolve(__dirname, 'fixtures', f), 'utf-8')
module.exports.log = (t, f = () => true) => {
  const cb = (...args) => f(...args) && console.error(...args)
  process.on('log', cb)
  t.teardown(() => process.off('log', cb))
}

// make tap not report this as skipping tests
t.ok(1)
