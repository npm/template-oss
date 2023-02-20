const { join, isAbsolute } = require('path')
const { defaultsDeep, pick } = require('lodash')
const deepMapValues = require('just-deep-map-values')
const { partition } = require('lodash')
const localeCompare = require('@isaacs/string-locale-compare')('en')
const fs = require('fs/promises')
const { rmEach, parseEach } = require('./files')
const gitignore = require('../../gitignore')

const FILE_KEYS = ['files', 'rootFiles']
const ADD = 'add'
const REMOVE = 'rm'
const solution = 'npx template-oss-apply --force'

const applyFiles = async (fileOptions, options) => {
  const { rm, add } = fileOptions.files

  options.log.verbose('rm', rm)
  await rmEach({ ...fileOptions, files: rm }, options, (f) => fs.rm(f))

  options.log.verbose('add', add)
  await parseEach({ ...fileOptions, files: add }, options, (p) => p.applyWrite())
}

const checkFiles = async (fileOptions, options) => {
  const { add: addFiles, rm: rmFiles } = fileOptions.files

  const res = []

  const rm = await rmEach({
    ...fileOptions,
    files: rmFiles,
  }, options, (f) => options.relativeToRoot(f))

  options.log.verbose('rm', rm)

  if (rm.length) {
    res.push({
      title: `The following $files need to be deleted:`,
      body: rm.sort(localeCompare),
      solution,
    })
  }

  const addOrUpdate = await parseEach({ ...fileOptions, files: addFiles }, options, async (p) => {
    const diff = await p.applyDiff()
    const target = options.relativeToRoot(p.target)

    if (diff === null) {
      // needs to be added
      return target
    } else if (diff === true) {
      // its ok, no diff, this is filtered out
      return null
    }

    return { file: target, diff: diff ?? '' }
  })

  const [add, update] = partition(addOrUpdate, (d) => typeof d === 'string')

  add.sort(localeCompare)
  update.sort((a, b) => localeCompare(a.file, b.file))

  options.log.verbose('add', add)

  if (add.length) {
    res.push({
      title: `The following files need to be added:`,
      body: add,
      solution,
    })
  }

  options.log.verbose('update', update)

  res.push(...update.map(({ file, diff }) => {
    return {
      title: `The file ${file} needs to be updated:`,
      body: [`${file}\n${'='.repeat(40)}\n${diff}`.trim()],
      solution,
    }
  }))

  return res
}

const resolveFile = (file, baseDir = '') => {
  try {
    // can it be required?
    return require.resolve(file)
  } catch {
    return isAbsolute(file) ? file : join(baseDir, file)
  }
}

const filesConfig = (ruleOptions, baseDir) => {
  const normalizeFiles = (o) => pick(deepMapValues(o, (value, key) => {
    if (key === REMOVE && Array.isArray(value)) {
      return value.reduce((acc, k) => {
        acc[k] = true
        return acc
      }, {})
    }
    if (typeof value === 'string') {
      const file = resolveFile(value, baseDir)
      return key === 'file' ? file : { file }
    }
    if (value === true && FILE_KEYS.includes(key)) {
      return { [ADD]: {}, [REMOVE]: {} }
    }
    if (value === true && (key === ADD || key === REMOVE)) {
      return {}
    }
    return value
  }), FILE_KEYS)

  const defaultFiles = FILE_KEYS.reduce((acc, k) => {
    acc[k] = { [ADD]: {}, [REMOVE]: {} }
    return acc
  }, {})

  return defaultsDeep(normalizeFiles(ruleOptions), defaultFiles)
}

const filesData = (rule, options) => {
  const { pkg, wsPkgs } = options

  const rootDirs = gitignore.allowRootDir([
    // Allways allow module files in root or workspaces
    ...Object.keys(rule.options.files.add),
    // in the root allow all repo files
    ...pkg.isRoot ? Object.keys(rule.options.rootFiles.add) : [],
  ])

  const wsDirs = pkg.isRoot
    ? wsPkgs.map(p => pkg.relativeToRoot(p.path))
    : []

  return {
    ignorePaths: [
      ...gitignore.sort([
        ...rootDirs,
        ...pkg.data.lockfile ? ['!/package-lock.json'] : [],
        ...(pkg.data.allowPaths || []).map((p) => `!${p}`),
        ...(pkg.data.ignorePaths || []),
      ]),
      // these cant be sorted since they rely on order
      // to allow a previously ignored directoy
      ...gitignore.allowDir(wsDirs),
    ],
  }
}

module.exports = {
  name: 'files',
  apply: [{
    name: 'root',
    when: ({ options }) => options.needsUpdate,
    run: (o) => applyFiles({
      dir: o.rootPkg.path,
      baseDirs: o.rule.baseDirs,
      files: o.rule.options.rootFiles,
    }, o),
  }, {
    name: 'module',
    when: ({ options }) => options.needsUpdate,
    run: (o) => applyFiles({
      dir: o.pkg.path,
      baseDirs: o.rule.baseDirs,
      files: o.rule.options.files,
    }, o),
  }],
  check: [{
    name: 'root',
    run: (o) => checkFiles({
      dir: o.rootPkg.path,
      baseDirs: o.rule.baseDirs,
      files: o.rule.options.rootFiles,
    }, o),
  }, {
    name: 'module',
    run: (o) => checkFiles({
      dir: o.pkg.path,
      baseDirs: o.rule.baseDirs,
      files: o.rule.options.files,
    }, o),
  }],
  data: filesData,
  config: filesConfig,
}
