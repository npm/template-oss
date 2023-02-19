const core = require('@actions/core')
const main = require('./release-please.js')

const dryRun = !process.env.CI
const branch = dryRun ? process.argv[2] : core.getInput('branch')
const forcePullRequest = dryRun ? process.argv[3] : core.getInput('release-pr')

const outputPr = (val) => {
  if (!val) {
    return
  }
  if (dryRun) {
    console.log('PR:', val.title.toString())
    console.log('='.repeat(40))
    console.log(val.body.toString())
    console.log('='.repeat(40))
    for (const update of val.updates.filter(u => u.updater.changelogEntry)) {
      console.log('CHANGELOG:', update.path)
      console.log('-'.repeat(40))
      console.log(update.updater.changelogEntry)
      console.log('-'.repeat(40))
    }
    for (const update of val.updates.filter(u => u.updater.rawContent)) {
      console.log('package:', update.path)
      console.log('-'.repeat(40))
      console.log(JSON.parse(update.updater.rawContent).name)
      console.log(JSON.parse(update.updater.rawContent).version)
      console.log('-'.repeat(40))
    }
  } else {
    core.setOutput('pr', JSON.stringify(val))
    core.setOutput('pr-branch', val.headBranchName)
    core.setOutput('pr-number', val.number)
    core.setOutput('pr-sha', val.sha)
  }
}

const outputRelease = (val) => {
  if (!val) {
    return
  }
  if (dryRun) {
    console.log('ROOT RELEASE:', JSON.stringify(val, null, 2))
  } else {
    core.setOutput('release', JSON.stringify(val))
  }
}

const outputReleases = (val) => {
  if (!val) {
    return
  }
  if (dryRun) {
    console.log('ALL RELEASES:', JSON.stringify(val, null, 2))
  } else {
    core.setOutput('releases', JSON.stringify(val))
  }
}

main({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPOSITORY,
  dryRun,
  branch,
  forcePullRequest: forcePullRequest ? +forcePullRequest : null,
}).then(({ pr, release, releases }) => {
  outputPr(pr)
  outputRelease(release)
  outputReleases(releases)
  return null
}).catch(err => {
  if (dryRun) {
    console.error(err)
  } else {
    core.setFailed(`failed: ${err}`)
  }
})
