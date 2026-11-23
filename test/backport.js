const t = require('tap')
const { execFileSync } = require('node:child_process')
const { writeFileSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const backport = require('../lib/content/backport.cjs')

// Use a local bare remote and real cherry-picks; only GitHub API calls are faked.
const setup = (t, mode = 'squash') => {
  const root = t.testdir({ remote: {}, repo: {} })
  const cwd = join(root, 'repo')
  const git = (...args) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  git('init', '--bare', join(root, 'remote'))
  git('init', '-b', 'main')
  git('config', 'user.name', 'Test User')
  git('config', 'user.email', 'test@example.com')
  git('config', 'commit.gpgsign', 'false')
  git('config', 'core.autocrlf', 'false')
  git('remote', 'add', 'origin', join(root, 'remote'))
  const commit = (file, content, message) => {
    writeFileSync(join(cwd, file), content)
    git('add', file)
    git('commit', '-m', message)
    return git('rev-parse', 'HEAD')
  }
  const baseContent = Array.from({ length: 20 }, (_, i) => `line ${i + 1}\n`).join('')
  const base = commit('base.txt', baseContent, 'initial')
  git('branch', 'release/v1')
  git('branch', 'release/v2')
  git('checkout', '-b', 'feature')
  const commits = [
    mode === 'context'
      ? commit('base.txt', baseContent.replace('line 18', 'changed 18'), 'fix: context')
      : commit('one.txt', 'one\n', 'fix: same subject'),
  ]
  if (!['single', 'context'].includes(mode)) {
    commits.push(commit('two.txt', 'two\n', 'fix: same subject'))
  }
  const head = git('rev-parse', 'HEAD')
  git('checkout', 'main')
  commit('unrelated.txt', 'unrelated\n', 'fix: same subject')
  if (mode === 'merge') {
    git('merge', '--no-ff', 'feature', '-m', 'merge feature')
  } else if (mode === 'squash') {
    git('merge', '--squash', 'feature')
    git('commit', '-m', 'fix: same subject')
  } else {
    git('cherry-pick', ...commits)
  }
  const merged = git('rev-parse', 'HEAD')
  git('push', '--all', 'origin')

  const pr = {
    number: 42,
    merged: true,
    merge_commit_sha: merged,
    commits: commits.length,
    title: 'fix: `untrusted title` $(not-a-command)',
    head: { sha: head },
    base: { sha: merged },
    labels: [{ name: 'backport:v1' }, { name: 'backport:v2' }, { name: 'bug' }],
  }
  const context = {
    repo: { owner: 'other-owner', repo: 'any-repo' },
    payload: { action: 'closed', pull_request: pr },
  }
  const calls = { created: [], dispatched: [], errors: [], failed: [], summaries: [], prs: [] }
  const github = {
    paginate: (fn, args) => fn(args),
    rest: {
      pulls: {
        get: async () => ({ data: pr }),
        listCommits: async () => commits.map(sha => ({ sha })),
        list: async args =>
          calls.prs.filter(p => args.head === `other-owner:${p.head.ref}` && args.base === p.base.ref),
        create: async args => {
          calls.created.push(args)
          const created = {
            number: 100 + calls.created.length,
            state: 'open',
            head: { ref: args.head },
            base: { ref: args.base },
          }
          calls.prs.push(created)
          return { data: created }
        },
      },
      actions: {
        createWorkflowDispatch: async args => calls.dispatched.push(args),
      },
    },
  }
  const core = {
    info: () => {},
    error: message => calls.errors.push(message),
    setFailed: message => calls.failed.push(message),
    summary: {
      addHeading: () => core.summary,
      addCodeBlock: text => {
        calls.summaries.push(text)
        return core.summary
      },
      write: async () => {},
    },
  }
  const run = async ({ checkout = cwd, beforeGit = () => {} } = {}) => {
    const exec = require('node:child_process').execFileSync
    const helper = t.mockRequire('../lib/content/backport.cjs', {
      'node:child_process': {
        execFileSync: (cmd, args, opts) => {
          beforeGit(args)
          return exec(cmd, args, { ...opts, cwd: opts.cwd || checkout })
        },
      },
    })
    await helper({ github, context, core })
  }
  return { root, cwd, git, commit, base, baseContent, merged, pr, context, github, core, calls, run }
}

t.test('single-commit PRs and reruns with changed release diff context', async t => {
  const s = setup(t, 'context')
  s.pr.labels = [{ name: 'backport:v1' }]
  s.git('checkout', 'release/v1')
  s.commit('base.txt', s.baseContent.replace('line 16', 'changed 16'), 'release-only context')
  s.git('push', 'origin', 'release/v1')
  s.git('checkout', 'main')
  await s.run()
  t.same(s.calls.errors, [])
  s.git('checkout', 'release/v1')
  s.commit('later.txt', 'later\n', 'release advances after backport')
  s.git('push', 'origin', 'release/v1')
  s.git('checkout', 'main')
  await s.run()
  t.same(s.calls.errors, [])
  t.equal(s.calls.created.length, 1)
  t.equal(s.calls.dispatched.length, 2)
})

t.test('irrelevant events do not access the API or git', async t => {
  for (const payload of [
    {},
    { action: 'closed', pull_request: { merged: false } },
    { action: 'opened', pull_request: { merged: true } },
    { action: 'labeled', label: { name: 'bug' }, pull_request: { merged: true } },
  ]) {
    await backport({ context: { payload } })
  }
  t.pass('irrelevant events ignored')
})

for (const mode of ['squash', 'merge', 'rebase']) {
  t.test(`${mode}: multiple targets, complete changes, safe reruns`, async t => {
    const s = setup(t, mode)
    await s.run()
    t.same(s.calls.errors, [])
    t.same(s.calls.failed, [])
    t.equal(s.calls.created.length, 2)
    for (const version of ['v1', 'v2']) {
      const branch = `backport/${version}/42`
      s.git('fetch', 'origin', branch)
      t.equal(s.git('show', 'FETCH_HEAD:one.txt'), 'one')
      t.equal(s.git('show', 'FETCH_HEAD:two.txt'), 'two')
      t.notMatch(
        s.git('ls-tree', '--name-only', 'FETCH_HEAD'),
        'unrelated.txt',
        'does not pick unrelated commits with matching subjects',
      )
      t.equal(s.git('rev-list', '--count', `${s.base}..FETCH_HEAD`), mode === 'rebase' ? '2' : '1')
      t.equal(s.git('rev-parse', `release/${version}`), s.base, 'release branch untouched')
      t.equal(s.git('ls-remote', 'origin', `refs/heads/release/${version}`).split(/\s/)[0], s.base)
    }
    t.equal(s.calls.created[0].owner, 'other-owner')
    t.equal(s.calls.created[0].title, s.pr.title, 'title is API data, not executable source')
    t.same(
      s.calls.dispatched.map(c => [c.workflow_id, c.ref]),
      [
        ['ci.yml', 'backport/v1/42'],
        ['ci.yml', 'backport/v2/42'],
      ],
    )
    s.context.payload.action = 'labeled'
    s.context.payload.label = { name: 'backport:v2' }
    await s.run()
    t.equal(s.calls.created.length, 2, 'reruns reuse PRs')
    t.equal(s.calls.dispatched.length, 4, 'reruns can retry CI on all requested targets')
    t.same(s.calls.errors, [])
    t.equal(s.git('rev-parse', 'HEAD'), s.merged, 'trusted checkout unchanged')
    t.match(readFileSync(join(s.cwd, 'one.txt'), 'utf8'), 'one')
  })
}

t.test('missing/invalid targets fail independently while valid targets proceed', async t => {
  const s = setup(t)
  s.pr.labels = ['backport:missing', 'backport:../../bad', 'backport:', 'backport:v1', 'backport:v1'].map(name => ({
    name,
  }))
  await s.run()
  t.equal(s.calls.created.length, 1, 'deduplicates labels')
  t.equal(s.calls.errors.length, 3)
  t.match(s.calls.errors[0], 'does not exist')
  t.match(s.calls.failed[0], '3 backport target(s) failed')
})

t.test('no labels do not touch git', async t => {
  const s = setup(t)
  s.pr.labels = []
  await s.run()
  t.same(s.calls.created, [])
  t.same(s.calls.errors, [])
})

t.test('cherry-pick conflicts are explicit and other targets still succeed', async t => {
  const s = setup(t)
  s.git('checkout', 'release/v1')
  s.commit('one.txt', 'conflicting change\n', 'different fix')
  s.git('push', 'origin', 'release/v1')
  s.git('checkout', 'main')
  await s.run()
  t.match(s.calls.errors[0], 'Cherry-pick conflict')
  t.equal(s.calls.created.length, 1)
  t.equal(s.calls.created[0].base, 'release/v2')
  t.equal(s.git('worktree', 'list', '--porcelain').match(/worktree /g).length, 1, 'temporary worktrees removed')
})

t.test('recover pushed branches after PR API failure and retry CI failures', async t => {
  const s = setup(t)
  s.pr.labels = [{ name: 'backport:v1' }]
  const create = s.github.rest.pulls.create
  s.github.rest.pulls.create = async () => {
    throw new Error('PR API denied')
  }
  await s.run()
  t.match(s.calls.errors[0], 'PR API denied')
  t.match(s.calls.errors[0], 'creating backport PR')
  t.notMatch(s.calls.errors[0], /conflict/i)
  t.match(s.git('ls-remote', 'origin', 'refs/heads/backport/v1/42'), /^[a-f0-9]{40}/)
  s.github.rest.pulls.create = create
  const dispatch = s.github.rest.actions.createWorkflowDispatch
  s.github.rest.actions.createWorkflowDispatch = async () => {
    throw new Error('CI API denied')
  }
  await s.run()
  t.equal(s.calls.created.length, 1, 'orphaned branch becomes a PR')
  t.match(s.calls.errors[1], 'CI API denied')
  t.match(s.calls.errors[1], 'dispatching ci.yml for PR #101')
  s.github.rest.actions.createWorkflowDispatch = dispatch
  await s.run()
  t.equal(s.calls.created.length, 1, 'CI retry does not duplicate PR')
  t.equal(s.calls.dispatched.length, 1)
})

t.test('a branch created after the absence check is not changed by the push', async t => {
  const s = setup(t)
  let raced = false
  await s.run({
    beforeGit: args => {
      if (args[0] === 'push' && args.includes('HEAD:refs/heads/backport/v1/42')) {
        s.git('push', 'origin', `${s.base}:refs/heads/backport/v1/42`)
        raced = true
      }
    },
  })
  t.ok(raced, 'another writer creates the branch just before the push')
  t.equal(s.git('ls-remote', 'origin', 'refs/heads/backport/v1/42').split(/\s/)[0], s.base)
  t.equal(s.calls.errors.length, 1)
  t.match(s.calls.errors[0], 'cherry-picking and pushing backport branch')
  t.notMatch(s.calls.errors[0], 'Cherry-pick conflict')
  t.same(
    s.calls.created.map(p => p.base),
    ['release/v2'],
    'other targets still succeed',
  )
  t.same(
    s.calls.dispatched.map(c => c.ref),
    ['backport/v2/42'],
  )
  t.match(s.calls.failed[0], '1 backport target(s) failed')
})

t.test('squash detection fetches a base commit that appeared after checkout', async t => {
  const s = setup(t)
  const checkout = join(s.root, 'checkout')
  s.git('clone', '--no-local', '--branch', 'main', join(s.root, 'remote'), checkout)
  s.pr.base.sha = s.commit('later.txt', 'later\n', 'default branch advances after checkout')
  s.git('push', 'origin', 'main')
  t.throws(
    () =>
      execFileSync('git', ['cat-file', '-e', s.pr.base.sha], {
        cwd: checkout,
        stdio: 'pipe',
      }),
    'the API base commit is not in the checkout',
  )
  await s.run({ checkout })
  t.same(s.calls.errors, [])
  t.same(s.calls.failed, [])
  t.equal(s.calls.created.length, 2)
  t.equal(s.calls.dispatched.length, 2)
})

t.test('unexpected existing branches and closed PRs require manual intervention', async t => {
  const s = setup(t)
  s.git('checkout', 'release/v1')
  s.commit('wrong.txt', 'not the backport\n', `forged\n\n(cherry picked from commit ${s.merged})`)
  s.git('push', 'origin', 'HEAD:refs/heads/backport/v1/42')
  s.git('checkout', 'main')
  s.calls.prs.push({
    number: 99,
    state: 'closed',
    head: { ref: 'backport/v2/42' },
    base: { ref: 'release/v2' },
  })
  await s.run()
  t.match(s.calls.errors[0], 'unexpected changes')
  t.match(s.calls.errors[1], 'closed without merging')
  t.same(s.calls.created, [])
  t.same(s.calls.dispatched, [])
  s.calls.prs[0].merged_at = '2026-01-01'
  await s.run()
  t.match(s.calls.summaries.at(-1), 'already merged as #99')
})

t.test('ambiguous and truncated single-parent histories fail without dropping commits', async t => {
  const s = setup(t, 'rebase')
  s.pr.labels = [{ name: 'backport:v1' }]
  s.pr.commits = 251
  await s.run()
  t.match(s.calls.errors[0], 'Cannot verify all PR commits')
  s.pr.commits = 2
  s.pr.merge_commit_sha = s.commit('two.txt', 'different result\n', 'fix: same subject')
  s.git('push', 'origin', 'main')
  await s.run()
  t.match(s.calls.errors[1], 'Cannot safely distinguish squash/rebase')
  s.git('checkout', '-b', 'altered-squash', s.base)
  writeFileSync(join(s.cwd, 'one.txt'), 'one\n')
  s.git('add', 'one.txt')
  s.pr.merge_commit_sha = s.commit('two.txt', 'two \n', 'fix: same subject')
  s.pr.base.sha = s.pr.merge_commit_sha
  s.git('push', 'origin', 'altered-squash')
  await s.run()
  t.match(s.calls.errors[2], 'Cannot safely distinguish squash/rebase', 'whitespace changes are not ignored')
  t.same(s.calls.created, [])
})

t.test('git transport failures are not interpreted as missing branches or conflicts', async t => {
  const s = setup(t)
  s.git('remote', 'set-url', 'origin', join(s.root, 'does-not-exist'))
  await s.run()
  t.equal(s.calls.errors.length, 2)
  t.notMatch(s.calls.errors.join('\n'), /does not exist|Cherry-pick conflict/)
  t.same(s.calls.created, [])
})
