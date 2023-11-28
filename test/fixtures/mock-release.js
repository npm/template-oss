const nock = require('nock')
const { resolve, relative, dirname, sep, join, basename } = require('path')
const fs = require('fs')

const DIR = __dirname
const CWD = process.cwd()
const RECORD = 'NOCK_RECORD' in process.env ? true : undefined

// These are the live GitHub repo and branch that are used to
// record fixtures for these tests
const REPO = 'npm/npm-cli-release-please'
const BRANCH = 'template-oss-mock-testing-branch-do-not-delete'

const getPath = (t) => {
  const fixtureName = relative(CWD, t.testdirName).split(`${sep}tap-testdir-`)[1]
  return {
    fixtureName: basename(fixtureName),
    fixturePath: resolve(DIR, 'nocks', `${fixtureName}.json`),
  }
}

const setup = (t) => {
  const { fixtureName, fixturePath } = getPath(t)

  // name snapshots by the fixture name so they are all in separate files. this
  // helps when trying to record/update snapshots so they dont delete other
  // snapshots.
  const snapshotDir = dirname(t.snapshotFile)
  const snapshotFile = basename(t.snapshotFile)
  t.snapshotFile = join(snapshotDir, fixtureName + snapshotFile.slice(snapshotFile.indexOf('.')))

  const record = typeof RECORD === 'boolean' ? RECORD : !fs.existsSync(fixturePath)
  const token = record ? process.env.GITHUB_TOKEN : 'mock_token'

  if (record) {
    if (!token) {
      t.fail('process.env.GITHUB_TOKEN must be set to record tests')
    }
    if (process.env.CI) {
      t.fail('cannot record fixtures in CI, only locally')
    }
    fs.mkdirSync(dirname(fixturePath), { recursive: true })
    fs.rmSync(fixturePath, { force: true })
    nock.recorder.rec({ output_objects: true, dont_print: true })
  } else {
    nock.define(nock.loadDefs(fixturePath))
    nock.disableNetConnect()
  }

  t.teardown(() => {
    if (record) {
      fs.writeFileSync(fixturePath, JSON.stringify(nock.recorder.play()), 'utf-8')
      nock.recorder.clear()
      nock.restore()
    } else {
      nock.enableNetConnect()
    }
  })

  return { token, record }
}

const releasePlease = async (t, { setup: s, ...opts } = {}) => {
  const ReleasePlease = t.mock('../../lib/release/release-please.js')
  try {
    return await ReleasePlease.run({
      token: s.token,
      repo: REPO,
      branch: BRANCH,
      silent: !s.record,
      trace: true,
      defaultTag: 'latest',
      ...opts,
    })
  } catch (e) {
    // These errors are extremely verbose so we remove some properties and
    // then explicitly call fail with the updated error
    delete e?.cause?.request?.body
    t.fail(e)
  }
}

const releaseManager = (t, {
  cwd = t.testdir({ 'package.json': '{"name":"pkg"}' }),
  ...opts
} = {}) => {
  const s = setup(t)
  const ReleaseManager = t.mock('../../lib/release/release-manager.js')
  return ReleaseManager.run({
    token: s.token,
    repo: REPO,
    silent: !s.record,
    cwd,
    defaultTag: 'latest',
    ...opts,
  })
}

module.exports = {
  setup,
  releasePlease,
  releaseManager,
  BRANCH,
  REPO,
  REPO_DIR: resolve(process.cwd(), '../..', REPO),
}
