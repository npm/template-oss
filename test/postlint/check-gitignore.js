const t = require('tap')
const { sync: which } = require('which')
const { spawnSync } = require('child_process')
const fs = require('fs')
const { resolve } = require('path')

const check = require('../../lib/postlint/check-gitignore.js')

const gitCwd = (cwd) => (args) =>
  spawnSync(which('git'), args.split(' '), { encoding: 'utf-8', cwd }).stdout

const gitTestdir = (t, files) => {
  const path = t.testdir(files)
  const git = gitCwd(path)

  git('init')
  git('add -A .')
  git('commit -m "init"')

  const appendGitignore = (append) => {
    fs.appendFileSync(resolve(path, '.gitignore'), append)
    git('add -A .')
    git('commit -m "update gitignore"')
  }

  return { path, appendGitignore }
}

t.test('will report tracked files in gitignore', async (t) => {
  const { path, appendGitignore } = gitTestdir(t, {
    '.gitignore': '# comment\n\n\n\nignored\n',
    ignored: '',
    tracked: '',
    willIgnore1: '',
    willIgnore2: '',
  })

  appendGitignore('willIgnore*\n')

  const problems = await check(path)

  t.equal(problems.length, 1)
  t.strictSame(problems[0].message.match(/\bwillIgnore1\b/), ['willIgnore1'])
  t.strictSame(problems[0].message.match(/\bwillIgnore2\b/), ['willIgnore2'])
  t.matchSnapshot(problems)
})

t.test('no warnings', async (t) => {
  const { path, appendGitignore } = gitTestdir(t, {
    '.gitignore': 'ignored\n',
    ignored: '',
    tracked: '',
    willIgnore1: '',
    willIgnore2: '',
  })

  appendGitignore('wontIgnore*\n')

  const problems = await check(path)

  t.equal(problems.length, 0)
  t.strictSame(problems, [])
  t.matchSnapshot(problems)
})

t.test('noop with no .git', async (t) => {
  const path = t.testdir()
  t.strictSame(await check(path), [])
})

t.test('error with .git but no .gitignore', async (t) => {
  const path = t.testdir({
    '.git': '',
  })
  t.rejects(check(path), /\.gitignore must exist/)
})
