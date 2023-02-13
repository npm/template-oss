const makeGh = require('./github.js')
const { link, code, specRe, list, dateFmt } = require('./util')

module.exports = class ChangelogNotes {
  constructor (options) {
    this.gh = makeGh(options.github)
  }

  buildEntry (commit, authors = []) {
    const breaking = commit.notes
      .filter(n => n.title === 'BREAKING CHANGE')
      .map(n => n.text)

    const entry = []

    if (commit.sha) {
      // A link to the commit
      entry.push(link(code(commit.sha.slice(0, 7)), this.gh.commit(commit.sha)))
    }

    // A link to the pull request if the commit has one
    const prNumber = commit.pullRequest?.number
    if (prNumber) {
      entry.push(link(`#${prNumber}`, this.gh.pull(prNumber)))
    }

    // The title of the commit, with the optional scope as a prefix
    const scope = commit.scope && `${commit.scope}:`
    const subject = commit.bareMessage.replace(specRe, code('$1'))
    entry.push([scope, subject].filter(Boolean).join(' '))

    // A list og the authors github handles or names
    if (authors.length && commit.type !== 'deps') {
      entry.push(`(${authors.join(', ')})`)
    }

    return {
      entry: entry.join(' '),
      breaking,
    }
  }

  async buildNotes (rawCommits, { version, previousTag, currentTag, changelogSections }) {
    const changelog = changelogSections.reduce((acc, c) => {
      if (!c.hidden) {
        acc[c.type] = {
          title: c.section,
          entries: [],
        }
      }
      return acc
    }, {
      breaking: {
        title: '⚠️ BREAKING CHANGES',
        entries: [],
      },
    })

    // Only continue with commits that will make it to our changelog
    const commits = rawCommits.filter(c => changelog[c.type])

    const authorsByCommit = await this.gh.authors(commits)

    // Group commits by type
    for (const commit of commits) {
      // when rebase merging multiple commits with a single PR, only the first commit
      // will have a pr number when coming from release-please. this check will manually
      // lookup commits without a pr number and find one if it exists
      if (!commit.pullRequest?.number) {
        commit.pullRequest = { number: await this.gh.commitPrNumber(commit) }
      }
      const { entry, breaking } = this.buildEntry(
        commit,
        authorsByCommit[commit.sha]
      )

      // Collect commits by type
      changelog[commit.type].entries.push(entry)

      // And push breaking changes to its own section
      changelog.breaking.entries.push(...breaking)
    }

    const sections = Object.values(changelog)
      .filter((s) => s.entries.length)
      .map(({ title, entries }) => [`### ${title}`, entries.map(list).join('\n')].join('\n\n'))

    const title = `## ${link(version, this.gh.compare(previousTag, currentTag))} (${dateFmt()})`

    return [title, ...sections].join('\n\n').trim()
  }
}
