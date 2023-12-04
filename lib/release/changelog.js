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

  constructor ({ version, url, sections }) {
    this.#title = `## ${url ? link(version, url) : version} (${formatDate()})`
    for (const section of sections) {
      this.#types.add(section.type)
      this.#sections[section.type] = section
      this.#titles[section.type] = section.section
    }
  }

  add (type, ...entries) {
    if (!this.#types.has(type) || !entries.length) {
      return
    }
    this.#entries[type] ??= []
    this.#entries[type].push(...entries)
  }

  #getEntries (type) {
    const section = this.#sections[type]
    const entries = this.#entries[type].map(list)
    if (section?.collapse) {
      entries.unshift('<details><summary>Commits</summary>\n')
      entries.push('\n</details>')
    }
    return entries.join('\n')
  }

  toString () {
    const body = [this.#title]
    for (const type of this.#types) {
      const title = this.#titles[type]
      if (this.#entries[type]?.length) {
        body.push(
          `### ${title}`,
          this.#getEntries(type)
        )
      }
    }
    return body.join('\n\n').trim()
  }
}

class ChangelogNotes {
  #owner
  #repo
  #rest
  #graphql
  #ghUrl

  constructor (github) {
    this.#owner = github.repository.owner
    this.#repo = github.repository.repo
    this.#rest = github.octokit.rest
    this.#graphql = github.graphql
    this.#ghUrl = makeGitHubUrl(this.#owner, this.#repo)
  }

  async #getAuthorsForCommits (commits) {
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
            ${shas.map((s) => {
              return `_${s}: object (expression: "${s}") { ...CommitAuthors }`
            })}
          }
        }`
    )
    for (const [key, commit] of Object.entries(repository)) {
      if (commit) {
        authorsByCommit[key.slice(1)] = commit.authors.nodes
          .map((a) => a.user && a.user.login ? `@${a.user.login}` : a.name)
          .filter(Boolean)
      }
    }
    return authorsByCommit
  }

  async #getPullRequestForCommits (commits) {
    const shas = commits
      .filter(c => !c.pullRequest?.number)
      .map(c => c.sha)
      .filter(Boolean)

    if (!shas.length) {
      return {}
    }

    const pullRequestsByCommit = {}
    for (const sha of shas) {
      pullRequestsByCommit[sha] = await this.#rest.repos.listPullRequestsAssociatedWithCommit({
        owner: this.#owner,
        repo: this.#repo,
        commit_sha: sha,
        per_page: 1,
      })
        .then((r) => r.data[0].number)
        .catch(() => null)
    }
    return pullRequestsByCommit
  }

  #buildEntry (commit, { authors = [], pullRequest }) {
    const entry = []

    if (commit.sha) {
      // A link to the commit
      entry.push(link(code(commit.sha.slice(0, 7)), this.#ghUrl('commit', commit.sha)))
    }

    // A link to the pull request if the commit has one
    const commitPullRequest = commit.pullRequest?.number ?? pullRequest
    if (commitPullRequest) {
      entry.push(link(`#${commitPullRequest}`, this.#ghUrl('pull', commitPullRequest)))
    }

    // The title of the commit, with the optional scope as a prefix
    const scope = commit.scope && `${commit.scope}:`
    const subject = wrapSpecs(commit.bareMessage)
    entry.push([scope, subject].filter(Boolean).join(' '))

    // A list og the authors github handles or names
    if (authors.length) {
      entry.push(`(${authors.join(', ')})`)
    }

    return entry.join(' ')
  }

  async buildNotes (commits, { version, previousTag, currentTag, changelogSections }) {
    // get authors for commits for each sha
    const authorsByCommit = await this.#getAuthorsForCommits(commits)

    // when rebase merging multiple commits with a single PR, only the first commit
    // will have a pr number when coming from release-please. this check will manually
    // lookup commits without a pr number and find one if it exists
    const pullRequestByCommit = await this.#getPullRequestForCommits(commits)

    const changelog = new Changelog({
      version,
      url: previousTag
        ? this.#ghUrl('compare', `${previousTag.toString()}...${currentTag.toString()}`)
        : null,
      sections: changelogSections,
    })

    for (const commit of commits) {
      // Collect commits by type
      changelog.add(commit.type, this.#buildEntry(commit, {
        authors: authorsByCommit[commit.sha],
        pullRequest: pullRequestByCommit[commit.sha],
      }))

      // And breaking changes to its own section
      changelog.add(Changelog.BREAKING, ...commit.notes
        .filter(n => n.title === 'BREAKING CHANGE')
        .map(n => n.text))
    }

    return changelog.toString()
  }
}

module.exports = ChangelogNotes
