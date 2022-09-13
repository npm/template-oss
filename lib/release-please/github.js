module.exports = (gh) => {
  const { owner, repo } = gh.repository

  const authors = async (commits) => {
    const response = {}

    const shas = commits.map(c => c.sha).filter(Boolean)

    if (!shas.length) {
      return response
    }

    try {
      const { repository } = await gh.graphql(
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
          repository (owner:"${owner}", name:"${repo}") {
            ${shas.map((s) => {
              return `_${s}: object (expression: "${s}") { ...CommitAuthors }`
            })}
          }
        }`
      )

      for (const [key, commit] of Object.entries(repository)) {
        if (commit) {
          response[key.slice(1)] = commit.authors.nodes
            .map((a) => a.user && a.user.login ? `@${a.user.login}` : a.name)
            .filter(Boolean)
        }
      }

      return response
    } catch {
      return response
    }
  }

  const url = (...p) => `https://github.com/${owner}/${repo}/${p.join('/')}`

  return {
    authors,
    pull: (number) => url('pull', number),
    commit: (sha) => url('commit', sha),
    compare: (a, b) => a ? url('compare', `${a.toString()}...${b.toString()}`) : null,
  }
}
