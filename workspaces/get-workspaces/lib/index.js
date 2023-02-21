const core = require('@actions/core')
const main = require('./ws.js')

const arg = core.getInput('files')
const all = arg === '--all'
const files = all ? [] : JSON.parse(arg || '[]')

module.exports = main({
  cwd: process.env.GITHUB_WORKSPACE,
  files,
  all,
})
  .then((r) => core.setOutput('flags', r.flags))
  .catch((err) => {
    core.setFailed(err)
  })
