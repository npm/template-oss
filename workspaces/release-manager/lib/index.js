
const core = require('@actions/core')
const main = require('./manager.js')

module.exports = main({
  cwd: process.env.GITHUB_WORKSPACE,
  token: core.getInput('token'),
  repository: process.env.GITHUB_REPOSITORY,
  prNumber: core.getInput('pr-number'),
  commentId: core.getInput('comment-id'),
})
  .then(() => console.error('Success'))
  .catch((err) => {
    core.setFailed(err)
  })
