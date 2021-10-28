const promiseSpawn = require('@npmcli/promise-spawn')
const t = require('tap')

const spawn = (name, args) => promiseSpawn(name, args, {
  stdioString: true,
  shell: true,
})

// Check if the repo is clean, ignoring the tests
const isClean = () => spawn('git',
  ['status', '--porcelain', '.', '--', ':!test/'])

// When the tests are run via `npm run preversion` it should fail
// if any of the changes haven't already been applied to this repo.
// Also note that this test has to be sequential so that there are
// no test/tap-testdir-* being created.
t.test('commands dont change repo', async (t) => {
  const startClean = await isClean()

  if (startClean.stdout) {
    t.equal(startClean.stdout, '', 'git status must be clean')
    const diff = await spawn('git',
      ['--no-pager', 'diff', '--word-diff=porcelain'])
    t.equal(diff, '', 'git diff')
    t.end()
    return
  }

  const postinstall = await spawn('npm', ['run', 'postinstall', '-s'])
  const postlint = await spawn('npm', ['run', 'postlint', '-s'])
  const clean = await isClean()

  t.equal(postinstall.stdout, '', 'postinstall stdout')
  t.equal(postinstall.stderr, '', 'postinstall stderr')
  t.equal(postinstall.code, 0, 'postinstall code')

  t.equal(postlint.stdout, '', 'postlint stdout')
  t.equal(postlint.stderr, '', 'postlint stderr')
  t.equal(postlint.code, 0, 'postlint code')

  t.equal(clean.stdout, '', 'git status is clean')
})
