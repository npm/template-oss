const core = require('@actions/core')
const main = require('./release-please.js')

const forcePullRequest = core.getInput('release-pr')

main({
  token: core.getInput('token'),
  repo: process.env.GITHUB_REPOSITORY,
  branch: core.getInput('branch'),
  dryRun: core.getInput('dry-run'),
  forcePullRequest: forcePullRequest ? +forcePullRequest : null,
}).then(({ pr, release, releases }) => {
  if (pr) {
    core.setOutput('pr', JSON.stringify(pr))
    core.setOutput('pr-branch', pr.headBranchName)
    core.setOutput('pr-number', pr.number)
    core.setOutput('pr-sha', pr.sha)
  }
  if (release) {
    core.setOutput('release', JSON.stringify(release))
  }
  if (releases) {
    core.setOutput('releases', JSON.stringify(releases))
  }
  return null
}).catch(err => {
  core.setFailed(err)
})
