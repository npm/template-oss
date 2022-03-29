const fs = require('@npmcli/fs')
const log = require('proc-log')
const { rmEach, parseEach } = require('../util/files.js')

const run = async (dir, files, options) => {
  const { rm = [], add = {} } = files

  log.verbose('apply-files', 'rm', rm)
  await rmEach(dir, rm, options, (f) => fs.rm(f))

  log.verbose('apply-files', 'add', add)
  await parseEach(dir, add, options, (p) => p.applyWrite())
}

module.exports = [{
  run: (options) => run(
    options.config.repoDir,
    options.config.repoFiles,
    options
  ),
  when: ({ config: c }) => c.applyRepo && c.needsUpdate,
  name: 'apply-repo',
}, {
  run: (options) => run(
    options.config.moduleDir,
    options.config.moduleFiles,
    options
  ),
  when: ({ config: c }) => c.applyModule && c.needsUpdate,
  name: 'apply-module',
}]
