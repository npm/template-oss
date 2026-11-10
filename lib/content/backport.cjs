const { execFileSync } = require('node:child_process')
const { mkdtempSync, rmdirSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')

module.exports = async ({ github, context, core }) => {
  const event = context.payload
  if (
    !event.pull_request?.merged ||
    !['closed', 'labeled'].includes(event.action) ||
    (event.action === 'labeled' && !event.label?.name.startsWith('backport:'))
  ) {
    return
  }

  const { owner, repo } = context.repo
  const api = { owner, repo }
  const number = event.pull_request.number
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new Error('Invalid pull request number')
  }
  const { data: pr } = await github.rest.pulls.get({ ...api, pull_number: number })
  if (!pr.merged) {
    throw new Error(`PR #${number} is not merged`)
  }
  // Re-read all labels so coalesced concurrent label events cannot lose a target.
  const versions = [...new Set(pr.labels.map(l => l.name).filter(n => n.startsWith('backport:')))].map(n =>
    n.slice('backport:'.length),
  )
  if (!versions.length) {
    core.info('No backport labels found')
    return
  }

  const exec = (args, options = {}) =>
    execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    })
  const git = (...args) => exec(args).trim()
  const sha = value => {
    if (!/^[a-f0-9]{40}$/.test(value)) {
      throw new Error('Missing or invalid commit SHA')
    }
    return value
  }
  const parents = commit => git('show', '-s', '--format=%P', commit).split(' ').filter(Boolean)
  const patch = (base, head) => {
    const diff = exec(['diff', '--no-ext-diff', '--no-textconv', '--binary', base, head, '--'])
    return exec(['patch-id', '--verbatim'], { input: diff }).split(' ')[0]
  }
  const commitPatch = commit => {
    const ps = parents(commit)
    return ps.length === 1 ? patch(ps[0], commit) : ''
  }
  const remoteRef = ref => {
    // An empty successful response means absence; transport/auth failures must propagate.
    const result = git('ls-remote', '--refs', 'origin', `refs/heads/${ref}`)
    return result ? sha(result.split(/\s/)[0]) : null
  }
  const fetch = commit => git('fetch', '--no-tags', 'origin', commit)

  let picks
  const getPicks = async () => {
    if (picks) {
      return picks
    }
    let changes
    const merged = sha(pr.merge_commit_sha)
    fetch(merged)
    const ps = parents(merged)
    if (ps.length === 2) {
      changes = [{ commit: merged, mainline: true, patch: patch(ps[0], merged) }]
    } else if (ps.length === 1 && pr.commits === 1) {
      changes = [{ commit: merged, patch: commitPatch(merged) }]
    } else if (ps.length === 1 && pr.commits > 1) {
      const head = sha(pr.head.sha)
      fetch(head)
      const commits = await github.paginate(github.rest.pulls.listCommits, {
        ...api,
        pull_number: number,
        per_page: 100,
      })
      // GitHub limits this endpoint to 250 commits. Never infer a truncated rebase.
      if (commits.length !== pr.commits || commits.at(-1)?.sha !== head) {
        throw new Error('Cannot verify all PR commits; create a manual backport')
      }
      const original = commits.map(c => commitPatch(sha(c.sha)))
      const candidates = git('rev-list', '--first-parent', `--max-count=${commits.length}`, merged)
        .split('\n')
        .reverse()
      if (candidates.length === original.length && original.every((p, i) => p && p === commitPatch(candidates[i]))) {
        changes = candidates.map(commit => ({ commit, patch: commitPatch(commit) }))
      } else {
        // A squash must match the entire PR diff, not just its subject or last commit.
        const baseSha = sha(pr.base.sha)
        fetch(baseSha)
        const base = git('merge-base', baseSha, head)
        const combined = patch(base, head)
        if (!combined || combined !== commitPatch(merged) || combined === original.at(-1)) {
          throw new Error('Cannot safely distinguish squash/rebase merge; create a manual backport')
        }
        changes = [{ commit: merged, patch: combined }]
      }
    } else {
      throw new Error('Unsupported merge history; create a manual backport')
    }
    if (changes.some(p => !p.patch)) {
      throw new Error('Empty changes cannot be backported automatically')
    }
    picks = changes
    return picks
  }

  const withWorktree = (target, fn) => {
    const dir = mkdtempSync(join(tmpdir(), 'template-oss-backport-'))
    const worktree = join(dir, 'worktree')
    let added = false
    try {
      git('worktree', 'add', '--detach', worktree, target)
      added = true
      return fn(worktree)
    } finally {
      if (added) {
        git('worktree', 'remove', '--force', worktree)
      }
      rmdirSync(dir)
    }
  }

  const cherryPick = (worktree, change) => {
    try {
      exec(
        [
          '-c',
          'user.name=github-actions[bot]',
          '-c',
          'user.email=41898282+github-actions[bot]@users.noreply.github.com',
          'cherry-pick',
          '-x',
          ...(change.mainline ? ['-m', '1'] : []),
          change.commit,
        ],
        { cwd: worktree },
      )
    } catch (error) {
      const conflicts = exec(['diff', '--name-only', '--diff-filter=U'], { cwd: worktree })
      throw new Error(
        conflicts
          ? `Cherry-pick conflict in ${conflicts}; create a manual backport`
          : `Cherry-pick failed (possibly already applied or empty): ${error.message}`,
        { cause: error },
      )
    }
  }

  const verifyBranch = (head, target, changes) => {
    fetch(head)
    let cursor = head
    const commits = []
    for (const change of [...changes].reverse()) {
      const message = git('show', '-s', '--format=%B', cursor)
      const ps = parents(cursor)
      if (ps.length !== 1 || !message.includes(`(cherry picked from commit ${change.commit})`)) {
        throw new Error('Existing backport branch has unexpected changes; inspect it manually')
      }
      commits.unshift(cursor)
      cursor = ps[0]
    }
    try {
      git('merge-base', '--is-ancestor', cursor, target)
    } catch (error) {
      if (error.status !== 1) {
        throw error
      }
      throw new Error('Existing backport branch is not based on the target history; inspect it manually')
    }
    // Replay on the original base: a clean pick can have different diff context on a release branch.
    withWorktree(cursor, worktree => {
      for (const [i, change] of changes.entries()) {
        cherryPick(worktree, change)
        const tree = exec(['rev-parse', 'HEAD^{tree}'], { cwd: worktree }).trim()
        if (tree !== git('rev-parse', `${commits[i]}^{tree}`)) {
          throw new Error('Existing backport branch has unexpected changes; inspect it manually')
        }
      }
    })
  }

  const createBranch = (branch, target, changes) =>
    withWorktree(target, worktree => {
      for (const change of changes) {
        cherryPick(worktree, change)
      }
      // An empty lease only permits creation, even if another writer races the absence check.
      exec(['push', `--force-with-lease=refs/heads/${branch}:`, 'origin', `HEAD:refs/heads/${branch}`], {
        cwd: worktree,
      })
    })

  const results = []
  for (const version of versions) {
    const target = `release/${version}`
    const branch = `backport/${version}/${number}`
    let stage = 'checking target'
    try {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(version)) {
        throw new Error('Invalid backport label suffix')
      }
      git('check-ref-format', `refs/heads/${target}`)
      git('check-ref-format', `refs/heads/${branch}`)
      const targetSha = remoteRef(target)
      if (!targetSha) {
        throw new Error(`Target branch ${target} does not exist`)
      }
      fetch(targetSha)
      stage = 'finding existing backport PRs'
      const prs = await github.paginate(github.rest.pulls.list, {
        ...api,
        head: `${owner}:${branch}`,
        base: target,
        state: 'all',
        per_page: 100,
      })
      const existing = prs.find(p => p.state === 'open') || prs[0]
      if (existing?.merged_at) {
        results.push(`${target}: already merged as #${existing.number}`)
        continue
      }
      if (existing && existing.state !== 'open') {
        throw new Error(`Backport PR #${existing.number} is closed without merging; reopen it manually`)
      }
      stage = 'verifying merged changes'
      const changes = await getPicks()
      stage = 'checking backport branch'
      const head = remoteRef(branch)
      if (head) {
        stage = 'verifying existing backport branch'
        verifyBranch(head, targetSha, changes)
      } else if (existing) {
        throw new Error(`Backport PR #${existing.number} has no branch; inspect it manually`)
      } else {
        stage = 'cherry-picking and pushing backport branch'
        createBranch(branch, targetSha, changes)
      }
      stage = 'creating backport PR'
      const backport =
        existing ||
        (
          await github.rest.pulls.create({
            ...api,
            title: pr.title,
            body: `Backport of #${number} to \`${target}\`.`,
            head: branch,
            base: target,
          })
        ).data
      stage = `dispatching ci.yml for PR #${backport.number}`
      await github.rest.actions.createWorkflowDispatch({
        ...api,
        workflow_id: 'ci.yml',
        ref: branch,
      })
      results.push(`${target}: PR #${backport.number}; CI dispatched`)
    } catch (error) {
      const message = `${target} (${stage}): ${error.message}`
      core.error(message)
      results.push(`FAILED ${message}`)
    }
  }
  core.summary.addHeading(`Backports for #${number}`).addCodeBlock(results.join('\n'))
  await core.summary.write()
  const failures = results.filter(r => r.startsWith('FAILED ')).length
  if (failures) {
    core.setFailed(`${failures} backport target(s) failed; see the job summary. Fix the cause and rerun.`)
  }
}
