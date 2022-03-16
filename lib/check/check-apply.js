const log = require('proc-log')
const { relative, basename } = require('path')
const { rmEach, parseEach } = require('../util/files.js')
const { partition } = require('lodash')

const solution = 'npx template-oss-apply --force'

const run = async (type, dir, files, options) => {
  const res = []
  const rel = (f) => relative(options.root, f)
  const { add: addFiles = {}, rm: rmFiles = [] } = files

  const rm = await rmEach(dir, rmFiles, options, (f) => rel(f))
  const [add, update] = partition(await parseEach(dir, addFiles, options, async (p) => {
    const diff = await p.applyDiff()
    const target = rel(p.target)
    if (diff === null) {
      // needs to be added
      return target
    } else if (diff === true) {
      // its ok, no diff, this is filtered out
      return null
    }
    return { file: target, diff }
  }), (d) => typeof d === 'string')

  log.verbose('check-apply', 'rm', rm)
  if (rm.length) {
    res.push({
      title: `The following ${type} files need to be deleted:`,
      body: rm,
      solution,
    })
  }

  log.verbose('check-apply', 'add', add)
  if (add.length) {
    res.push({
      title: `The following ${type} files need to be added:`,
      body: add,
      solution,
    })
  }

  log.verbose('check-apply', 'update', update)
  res.push(...update.map(({ file, diff }) => ({
    title: `The ${type} file ${basename(file)} needs to be updated:`,
    body: [`${file}\n${'='.repeat(40)}\n${diff}`],
    solution,
  })))

  return res
}

module.exports = [{
  run: (options) => run(
    'repo',
    options.config.repoDir,
    options.config.repoFiles,
    options
  ),
  when: ({ config: c }) => c.applyRepo,
  name: 'check-repo',
}, {
  run: (options) => run(
    'module',
    options.config.moduleDir,
    options.config.moduleFiles,
    options
  ),
  when: ({ config: c }) => c.applyModule,
  name: 'check-module',
}]
