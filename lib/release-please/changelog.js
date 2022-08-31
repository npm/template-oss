const RP = require('release-please/build/src/changelog-notes/default')

module.exports = class DefaultChangelogNotes extends RP.DefaultChangelogNotes {
  constructor (options) {
    super(options)
    this.github = options.github
  }

  async buildDefaultNotes (commits, options) {
    // The default generator has a title with the version and date
    // and a link to the diff between the last two versions
    const notes = await super.buildNotes(commits, options)
    const lines = notes.split('\n')

    let foundBreakingHeader = false
    let foundNextHeader = false
    const breaking = lines.reduce((acc, line) => {
      if (line.match(/^### .* BREAKING CHANGES$/)) {
        foundBreakingHeader = true
      } else if (!foundNextHeader && foundBreakingHeader && line.match(/^### /)) {
        foundNextHeader = true
      }
      if (foundBreakingHeader && !foundNextHeader) {
        acc.push(line)
      }
      return acc
    }, []).join('\n')

    return {
      title: lines[0],
      breaking: breaking.trim(),
    }
  }

  async buildNotes (commits, options) {
    const { title, breaking } = await this.buildDefaultNotes(commits, options)
    const body = await generateChangelogBody(commits, { github: this.github, ...options })
    return [title, breaking, body].filter(Boolean).join('\n\n')
  }
}

// a naive implementation of console.log/group for indenting console
// output but keeping it in a buffer to be output to a file or console
const logger = (init) => {
  let indent = 0
  const step = 2
  const buffer = [init]
  return {
    toString () {
      return buffer.join('\n').trim()
    },
    group (s) {
      this.log(s)
      indent += step
    },
    groupEnd () {
      indent -= step
    },
    log (s) {
      if (!s) {
        buffer.push('')
      } else {
        buffer.push(s.split('\n').map((l) => ' '.repeat(indent) + l).join('\n'))
      }
    },
  }
}

const generateChangelogBody = async (_commits, { github, changelogSections }) => {
  const changelogMap = new Map(
    changelogSections.filter(c => !c.hidden).map((c) => [c.type, c.section])
  )

  const { repository } = await github.graphql(
    `fragment commitCredit on GitObject {
      ... on Commit {
        message
        url
        abbreviatedOid
        authors (first:10) {
          nodes {
            user {
              login
              url
            }
            email
            name
          }
        }
        associatedPullRequests (first:10) {
          nodes {
            number
            url
            merged
          }
        }
      }
    }

    query {
      repository (owner:"${github.repository.owner}", name:"${github.repository.repo}") {
        ${_commits.map(({ sha: s }) => `_${s}: object (expression: "${s}") { ...commitCredit }`)}
      }
    }`
  )

  // collect commits by valid changelog type
  const commits = [...changelogMap.values()].reduce((acc, type) => {
    acc[type] = []
    return acc
  }, {})

  const allCommits = Object.values(repository)

  for (const commit of allCommits) {
    // get changelog type of commit or bail if there is not a valid one
    const [, type] = /(^\w+)[\s(:]?/.exec(commit.message) || []
    const changelogType = changelogMap.get(type)
    if (!changelogType) {
      continue
    }

    const message = commit.message
      .trim() // remove leading/trailing spaces
      .replace(/(\r?\n)+/gm, '\n') // replace multiple newlines with one
      .replace(/([^\s]+@\d+\.\d+\.\d+.*)/gm, '`$1`') // wrap package@version in backticks

    // the title is the first line of the commit, 'let' because we change it later
    let [title, ...body] = message.split('\n')

    const prs = commit.associatedPullRequests.nodes.filter((pull) => pull.merged)

    // external squashed PRs dont get the associated pr node set
    // so we try to grab it from the end of the commit title
    // since thats where it goes by default
    const [, titleNumber] = title.match(/\s+\(#(\d+)\)$/) || []
    if (titleNumber && !prs.find((pr) => pr.number === +titleNumber)) {
      try {
        // it could also reference an issue so we do one extra check
        // to make sure it is really a pr that has been merged
        const { data: realPr } = await github.octokit.pulls.get({
          owner: github.repository.owner,
          repo: github.repository.repo,
          pull_number: titleNumber,
        })
        if (realPr.state === 'MERGED') {
          prs.push(realPr)
        }
      } catch {
        // maybe an issue or something else went wrong
        // not super important so keep going
      }
    }

    for (const pr of prs) {
      title = title.replace(new RegExp(`\\s*\\(#${pr.number}\\)`, 'g'), '')
    }

    body = body
      .map((line) => line.trim()) // remove artificial line breaks
      .filter(Boolean) // remove blank lines
      .join('\n') // rejoin on new lines
      .split(/^[*-]/gm) // split on lines starting with bullets
      .map((line) => line.trim()) // remove spaces around bullets
      .filter((line) => !title.includes(line)) // rm lines that exist in the title
      // replace new lines for this bullet with spaces and re-bullet it
      .map((line) => `* ${line.trim().replace(/\n/gm, ' ')}`)
      .join('\n') // re-join with new lines

    commits[changelogType].push({
      hash: commit.abbreviatedOid,
      url: commit.url,
      title,
      type: changelogType,
      body,
      prs,
      credit: commit.authors.nodes.map((author) => {
        if (author.user && author.user.login) {
          return {
            name: `@${author.user.login}`,
            url: author.user.url,
          }
        }
        // if the commit used an email that's not associated with a github account
        // then the user field will be empty, so we fall back to using the committer's
        // name and email as specified by git
        return {
          name: author.name,
          url: `mailto:${author.email}`,
        }
      }),
    })
  }

  const output = logger()

  for (const key of Object.keys(commits)) {
    if (commits[key].length > 0) {
      output.group(`### ${key}\n`)

      for (const commit of commits[key]) {
        let groupCommit = `* [\`${commit.hash}\`](${commit.url})`

        for (const pr of commit.prs) {
          groupCommit += ` [#${pr.number}](${pr.url})`
        }

        groupCommit += ` ${commit.title}`
        if (key !== 'Dependencies') {
          for (const user of commit.credit) {
            groupCommit += ` (${user.name})`
          }
        }

        output.group(groupCommit)
        output.groupEnd()
      }

      output.log()
      output.groupEnd()
    }
  }

  return output.toString()
}
