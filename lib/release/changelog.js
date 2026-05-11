const { TagName } = require('release-please/build/src/util/tag-name.js')
const { link, code, wrapSpecs, list, formatDate, makeGitHubUrl } = require('./util')

class Changelog {
  static BREAKING = 'breaking'

  #title
  #entries = {}
  #types = new Set([Changelog.BREAKING])
  #sections = {}
  #titles = {
    [Changelog.BREAKING]: '⚠️ BREAKING CHANGES',
  }

  constructor({ version, url, sections }) {
    this.#title = `## ${url ? link(version, url) : version} (${formatDate()})`
    for (const section of sections) {
      this.#types.add(section.type)
      this.#sections[section.type] = section
      this.#titles[section.type] = section.section
    }
  }

  add(type, ...entries) {
    if (!this.#types.has(type) || !entries.length) {
      return
    }
    this.#entries[type] ??= []
    this.#entries[type].push(...entries)
  }

  #getEntries(type) {
    return this.#entries[type].map(list).join('\n')
  }

  toString() {
    const body = [this.#title]
    const includedTypes = []

    for (const type of this.#types) {
      if (this.#entries[type]?.length) {
        includedTypes.push(type)
        body.push(`### ${this.#titles[type]}`, this.#getEntries(type))
      }
    }

    // If every commit is from a hidden section then we return an
    // empty string which will skip the release PR being created.
    // We do this because we don't want PRs opened if they only contain
    // chores but we do want to rebuild existing PRs if chores are added.
    if (includedTypes.every(type => this.#sections[type]?.hidden)) {
      return ''
    }

    return body.join('\n').trim()
  }
}

class ChangelogNotes {
  #owner
  #repo
  #rest
  #graphql
  #ghUrl

  constructor(github) {
    this.#owner = github.repository.owner
    this.#repo = github.repository.repo
    this.#rest = github.octokit.rest
    this.#graphql = github.graphql
    this.#ghUrl = makeGitHubUrl(this.#owner, this.#repo)
  }

  // Parse the BREAKING CHANGES section out of a previously generated release body.
  // We look for a `### ` heading containing the word BREAKING and capture each subsequent `* note` line until we hit any next heading.
  #extractBreakingNotes(body) {
    if (!body) {
      return []
    }
    const notes = []
    let inBreaking = false
    for (const line of body.split('\n')) {
      if (/^#{1,6}\s/.test(line)) {
        inBreaking = /^#{1,6}\s.*BREAKING/i.test(line)
        continue
      }
      if (!inBreaking) {
        continue
      }
      const match = line.match(/^\*\s+(.*\S)\s*$/)
      if (match) {
        notes.push(match[1])
      }
    }
    return notes
  }

  // When exiting prerelease mode (e.g. v12.0.0-pre.3 -> v12.0.0), aggregate BREAKING CHANGE notes from every prerelease release that led to this final release.
  // Without this, breaking changes that landed during earlier prereleases get dropped from the final release body because release-please only builds the changelog from previousTag..currentTag.
  async #getPrereleaseBreakingNotes({ previousTag, currentTag }) {
    if (!previousTag || !currentTag) {
      return []
    }

    const previous = TagName.parse(previousTag.toString())
    const current = TagName.parse(currentTag.toString())

    if (!previous || !current) {
      return []
    }

    // Only aggregate when exiting prerelease mode: previous had a prerelease, current does not.
    if (!previous.version.preRelease || current.version.preRelease) {
      return []
    }

    // Both tags must refer to the same package (same component shape) and the same X.Y.Z base version.
    // This makes the trigger safe for backports, normal releases, and workspace releases.
    if (
      previous.component !== current.component ||
      previous.separator !== current.separator ||
      previous.includeV !== current.includeV ||
      previous.version.major !== current.version.major ||
      previous.version.minor !== current.version.minor ||
      previous.version.patch !== current.version.patch
    ) {
      return []
    }

    // Match prereleases that share the previous tag's prerelease identifier (e.g. `pre` for `pre.3`) so unrelated prerelease lineages like `rc.*` or `alpha.*` are not pulled in.
    const prereleaseId = previous.version.preRelease.split('.')[0]

    const prefixTag = new TagName(current.version, current.component, current.separator, current.includeV).toString()
    const refPrefix = `${prefixTag}-`

    const { data: refs } = await this.#rest.git.listMatchingRefs({
      owner: this.#owner,
      repo: this.#repo,
      ref: `tags/${refPrefix}`,
      per_page: 100,
    })

    const preTags = refs
      .map(r => r.ref.replace(/^refs\/tags\//, ''))
      .map(name => TagName.parse(name))
      .filter(
        t =>
          t &&
          t.component === current.component &&
          t.separator === current.separator &&
          t.includeV === current.includeV &&
          t.version.major === current.version.major &&
          t.version.minor === current.version.minor &&
          t.version.patch === current.version.patch &&
          t.version.preRelease &&
          t.version.preRelease.split('.')[0] === prereleaseId,
      )
      .sort((a, b) => a.version.compare(b.version))

    const seen = new Set()
    const notes = []
    for (const tag of preTags) {
      const tagName = tag.toString()
      let release
      try {
        release = await this.#rest.repos.getReleaseByTag({
          owner: this.#owner,
          repo: this.#repo,
          tag: tagName,
        })
      } catch (err) {
        if (err.status === 404) {
          continue
        }
        throw err
      }
      for (const note of this.#extractBreakingNotes(release.data.body)) {
        if (!seen.has(note)) {
          seen.add(note)
          notes.push(note)
        }
      }
    }
    return notes
  }

  async #getAuthorsForCommits(commits) {
    const shas = commits
      .filter(c => c.type !== 'deps')
      .map(c => c.sha)
      .filter(Boolean)

    if (!shas.length) {
      return {}
    }

    const authorsByCommit = {}
    const { repository } = await this.#graphql(
      `fragment CommitAuthors on GitObject {
          ... on Commit {
            authors (first:10) {
              nodes {
                user { login }
                name
              }
            }
          }
        }
        query {
          repository (owner:"${this.#owner}", name:"${this.#repo}") {
            ${shas.map(s => {
              return `_${s}: object (expression: "${s}") { ...CommitAuthors }`
            })}
          }
        }`,
    )
    for (const [key, commit] of Object.entries(repository)) {
      if (commit) {
        authorsByCommit[key.slice(1)] = commit.authors.nodes
          .map(a => (a.user && a.user.login ? `@${a.user.login}` : a.name))
          .filter(Boolean)
      }
    }
    return authorsByCommit
  }

  async #getPullRequestNumbersForCommits(commits) {
    const shas = commits
      .filter(c => !c.pullRequest?.number)
      .map(c => c.sha)
      .filter(Boolean)

    if (!shas.length) {
      return {}
    }

    const pullRequestsByCommit = {}
    for (const sha of shas) {
      pullRequestsByCommit[sha] = await this.#rest.repos
        .listPullRequestsAssociatedWithCommit({
          owner: this.#owner,
          repo: this.#repo,
          commit_sha: sha,
          per_page: 1,
        })
        .then(r => r.data[0].number)
        .catch(() => null)
    }
    return pullRequestsByCommit
  }

  #buildEntry(commit) {
    const entry = []

    if (commit.sha) {
      // A link to the commit
      entry.push(link(code(commit.sha.slice(0, 7)), this.#ghUrl('commit', commit.sha)))
    }

    // A link to the pull request if the commit has one
    const commitPullRequest = commit.pullRequestNumber
    if (commitPullRequest) {
      entry.push(link(`#${commitPullRequest}`, this.#ghUrl('pull', commitPullRequest)))
    }

    // The title of the commit, with the optional scope as a prefix
    const scope = commit.scope && `${commit.scope}:`
    const subject = wrapSpecs(commit.bareMessage)
    entry.push([scope, subject].filter(Boolean).join(' '))

    // A list of the authors github handles or names
    if (commit.authors.length) {
      entry.push(`(${commit.authors.join(', ')})`)
    }

    return entry.join(' ')
  }

  #filterCommits(commits) {
    const filteredCommits = []
    const keyedDuplicates = {}

    // Filter certain commits so we can make sure only the latest version of
    // each one gets into the changelog
    for (const commit of commits) {
      if (commit.bareMessage.startsWith('postinstall for dependabot template-oss PR')) {
        keyedDuplicates.templateOssPostInstall ??= []
        keyedDuplicates.templateOssPostInstall.push(commit)
        continue
      }

      if (commit.bareMessage.startsWith('bump @npmcli/template-oss from')) {
        keyedDuplicates.templateOssBump ??= []
        keyedDuplicates.templateOssBump.push(commit)
        continue
      }

      filteredCommits.push(commit)
    }

    // Sort all our duplicates so we get the latest verion (by PR number) of each type.
    // Then flatten so we can put them all back into the changelog
    const sortedDupes = Object.values(keyedDuplicates)
      .filter(items => Boolean(items.length))
      .map(items => items.sort((a, b) => b.pullRequestNumber - a.pullRequestNumber))
      .flatMap(items => items[0])

    // This moves them to the bottom of their changelog section which is not
    // strictly necessary but it's easier to do this way.
    for (const duplicate of sortedDupes) {
      filteredCommits.push(duplicate)
    }

    return filteredCommits
  }

  async buildNotes(rawCommits, { version, previousTag, currentTag, changelogSections }) {
    // get authors for commits for each sha
    const authors = await this.#getAuthorsForCommits(rawCommits)

    // when rebase merging multiple commits with a single PR, only the first commit
    // will have a pr number when coming from release-please. this check will manually
    // lookup commits without a pr number and find one if it exists
    const prNumbers = await this.#getPullRequestNumbersForCommits(rawCommits)

    const fullCommits = rawCommits.map(commit => {
      commit.authors = authors[commit.sha] ?? []
      commit.pullRequestNumber = Number(commit.pullRequest?.number ?? prNumbers[commit.sha])
      return commit
    })

    const changelog = new Changelog({
      version,
      url: previousTag ? this.#ghUrl('compare', `${previousTag.toString()}...${currentTag.toString()}`) : null,
      sections: changelogSections,
    })

    // When exiting prerelease mode we need to pull in any BREAKING CHANGE notes that were captured in earlier prerelease release bodies.
    const prereleaseBreakingNotes = await this.#getPrereleaseBreakingNotes({
      previousTag,
      currentTag,
    })
    const seenBreaking = new Set(prereleaseBreakingNotes)
    changelog.add(Changelog.BREAKING, ...prereleaseBreakingNotes)

    for (const commit of this.#filterCommits(fullCommits)) {
      // Collect commits by type
      changelog.add(commit.type, this.#buildEntry(commit))

      // And breaking changes to its own section, deduplicated against any notes we already pulled in from prerelease release bodies.
      const newBreaking = commit.notes
        .filter(n => n.title === 'BREAKING CHANGE')
        .map(n => n.text)
        .filter(n => !seenBreaking.has(n))
      for (const n of newBreaking) {
        seenBreaking.add(n)
      }
      changelog.add(Changelog.BREAKING, ...newBreaking)
    }

    return changelog.toString()
  }
}

module.exports = ChangelogNotes
