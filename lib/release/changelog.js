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

    return body.join('\n\n').trim()
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

    // A list og the authors github handles or names
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

    for (const commit of this.#filterCommits(fullCommits)) {
      // Collect commits by type
      changelog.add(commit.type, this.#buildEntry(commit))

      // And breaking changes to its own section
      changelog.add(Changelog.BREAKING, ...commit.notes.filter(n => n.title === 'BREAKING CHANGE').map(n => n.text))
    }

    return changelog.toString()
  }
}

module.exports = ChangelogNotes
