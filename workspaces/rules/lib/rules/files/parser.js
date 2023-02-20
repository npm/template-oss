const fs = require('fs/promises')
const { dirname, relative, join } = require('path')
const yaml = require('yaml')
const NpmPackageJson = require('@npmcli/package-json')
const jsonParse = require('json-parse-even-better-errors')
const Diff = require('diff')
const { unset, mergeWith } = require('lodash')
const ini = require('ini')
const esbuild = require('esbuild')
const minimatch = require('minimatch')
const template = require('./template.js')

// json diff takes a delete key to find values that should be deleted instead of diffed
const jsonDiff = require('./json-diff')(template.DELETE)

// create a patch and strip out the filename. if it ends up an empty string
// then return true since the files are equal
const strDiff = (t, s) => Diff.createPatch('', t, s).split('\n').slice(4).join('\n')

const merge = (...o) => mergeWith({}, ...o, (_, srcValue) => {
  if (Array.isArray(srcValue)) {
    // Dont merge arrays, last array wins
    return srcValue
  }
})

const setFirst = (first, rest) => ({ ...first, ...rest })

const traverse = (value, visit, keys = []) => {
  if (keys.length) {
    const res = visit(keys, value)
    if (res != null) {
      return
    }
  }
  if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      traverse(v, visit, keys.concat(k))
    }
  }
}

const fsOk = (code) => (error) => {
  if (error.code === 'ENOENT') {
    return null
  }
  return Object.assign(error, { code })
}

const state = new Map()

class Base {
  static types = []
  static header = 'This file is automatically added by {$ options.name $}. Do not edit.'
  static comment = (v) => v
  static template = template
  static diff = strDiff
  static clean = false
  static merge = false // supply a merge function which runs on prepare for certain types
  static DELETE = template.DELETE

  constructor (target, source, options) {
    this.target = target
    this.source = source
    this.options = options
    this.state.count++
  }

  get state () {
    if (!state.has(this.target)) {
      state.set(this.target, { count: 0 })
    }
    return state.get(this.target)
  }

  header () {
    if (typeof this.constructor.comment === 'function') {
      return this.constructor.comment(this.template(this.constructor.header || ''), this.options)
    }
  }

  clean () {
    if (this.state.count === 1 && this.constructor.clean) {
      return fs.rm(this.target).catch(fsOk())
    }
    return null
  }

  async read (s) {
    if (s === this.source) {
      this.options.log.info('read', s)
      // allow shadowing files in configured content directories
      // without needing to add the file to the config explicitly
      const dirs = this.options.baseDirs
      const relDir = dirs.find(d => s.startsWith(d))
      if (relDir) {
        const relFile = relative(relDir, s)
        const lookupDirs = dirs.slice(0).reverse()
        for (const dir of lookupDirs) {
          const file = await fs.readFile(join(dir, relFile), { encoding: 'utf-8' }).catch(fsOk())
          if (file !== null) {
            return file
          }
        }
      }
    }

    return fs.readFile(s, { encoding: 'utf-8' })
  }

  template (s) {
    if (typeof this.constructor.template === 'function') {
      return this.constructor.template(s, this.options)
    }
    return s
  }

  parse (s) {
    return s
  }

  prepare (s) {
    const header = this.header()
    return header ? `${header}\n\n${s}` : s
  }

  prepareTarget (s) {
    return s
  }

  toString (s) {
    return s.toString()
  }

  async write (s) {
    // XXX: find more efficient way to do this. we can build all possible dirs before get here
    await fs.mkdir(dirname(this.target), { recursive: true, force: true })
    await fs.writeFile(this.target, this.toString(s))
    this.options.log.info('write', this.target)
  }

  diff (t, s) {
    if (typeof this.constructor.diff === 'function') {
      const diff = this.constructor.diff(t, s)
      if (typeof diff === 'string') {
        return diff.trim() || true
      }
      return diff
    }
    return t === s
  }

  // the apply methods are the only ones that should be called publically
  // but everything is public interface so it can be overridden by child classes
  applyWrite () {
    return Promise.resolve(this.clean())
      .then(() => this.read(this.source))
      // replace template vars first, this will throw for nonexistant vars
      // because it must be parseable after this step
      .then((s) => this.template(s))
      // parse into whatever data structure is necessary for maniuplating
      // diffing, merging, etc. by default its a string
      .then((s) => {
        this.sourcePreParse = s
        return this.parse(s)
      })
      // prepare the source for writing and diffing, pass in current
      // target for merging. errors parsing or preparing targets are ok here
      .then((s) => this.applyTarget().catch(() => null).then((t) => this.prepare(s, t)))
      .then((s) => this.write(s))
  }

  applyTarget () {
    return Promise.resolve(this.read(this.target))
      .then((s) => this.parse(s))
      // for only preparing the target for diffing
      .then((s) => this.prepareTarget(s))
  }

  async applyDiff () {
    // handle if old does not exist
    const targetError = 'ETARGETERROR'
    const target = await this.applyTarget().catch(fsOk(targetError))

    // no need to diff if current file does not exist
    if (target === null) {
      return null
    }

    const source = await Promise.resolve(this.read(this.source))
      .then((s) => this.template(s))
      .then((s) => this.parse(s))
      // gets the target to diff against in case it needs to merge, etc
      .then((s) => this.prepare(s, target))

    // if there was a target error then return false to show that the file
    // is there but needs to be updated. skip showing a diff since it might be huge
    if (target.code === targetError) {
      return false
    }

    // individual diff methods are responsible for returning a string
    // representing the diff. an empty trimmed string means no diff
    return this.diff(target.replace(/\r\n/g, '\n'), source.replace(/\r\n/g, '\n'))
  }
}

class Gitignore extends Base {
  static types = ['codeowners', 'gitignore']
  static comment = (c) => `# ${c}`
}

class Js extends Base {
  static types = ['*.js']
  static comment = (c) => `/* ${c} */`
}

class Ini extends Base {
  static types = ['*.ini']
  static comment = (c) => `; ${c}`
  static diff = jsonDiff

  toString (s) {
    return typeof s === 'string' ? s : ini.stringify(s)
  }

  parse (s) {
    return typeof s === 'string' ? ini.parse(s) : s
  }

  prepare (s, t) {
    let source = s
    if (typeof this.constructor.merge === 'function' && t) {
      source = this.constructor.merge(t, s)
    }
    return super.prepare(this.toString(source))
  }

  diff (t, s) {
    return super.diff(this.parse(t), this.parse(s))
  }
}

class IniMerge extends Ini {
  static types = ['npmrc']
  static merge = merge
}

class Markdown extends Base {
  static types = ['*.md']
  static comment = (c) => `<!-- ${c} -->`
}

class Yml extends Base {
  static types = ['*.yml']
  static comment = (c) => ` ${c}`

  toString (s) {
    try {
      return s.toString({ lineWidth: 0, indent: 2 })
    } catch (err) {
      err.message = [this.target, this.sourcePreParse, ...s.errors, err.message].join('\n')
      throw err
    }
  }

  parse (s) {
    return yaml.parseDocument(s)
  }

  prepare (s) {
    s.commentBefore = this.header()
    return this.toString(s)
  }

  prepareTarget (s) {
    return this.toString(s)
  }
}

class YmlMerge extends Yml {
  prepare (source, t) {
    if (t === null) {
      // If target does not exist or is in an
      // error state, we cant do anything but write
      // the whole document
      return super.prepare(source)
    }

    const key = [].concat(this.constructor.key)

    const getId = (node) => {
      const index = node.items.findIndex(p => p.key?.value === this.constructor.id)
      return index !== -1 ? node.items[index].value?.value : node.toJSON()
    }

    const target = this.parse(t)
    const targetNodes = target.getIn(key).items.reduce((acc, node, index) => {
      acc[getId(node)] = { node, index }
      return acc
    }, {})

    for (const node of source.getIn(key).items) {
      const index = targetNodes[getId(node)]?.index
      if (typeof index === 'number' && index !== -1) {
        target.setIn([...key, index], node)
      } else {
        target.addIn(key, node)
      }
    }

    return super.prepare(target)
  }
}

class Json extends Base {
  static types = ['*.json']
  // its a json comment! not really but we do add a special key
  // to json objects
  static comment = (c, o) => ({ [o.options.name]: c })
  static diff = jsonDiff

  toString (s) {
    return JSON.stringify(
      s,
      (_, v) => v === this.constructor.DELETE ? undefined : v,
      2
    ).trim() + '\n'
  }

  parse (s) {
    return jsonParse(s)
  }

  prepare (s, t) {
    let source = s
    if (typeof this.constructor.merge === 'function' && t) {
      source = this.constructor.merge(t, s)
    }
    return setFirst(this.header(), source)
  }
}

class JsonMerge extends Json {
  static header = 'This file is partially managed by {$ options.name $}. Edits may be overwritten.'
  static merge = merge
}

class PackageJson extends JsonMerge {
  static types = ['pkg.json']

  async prepare (s, t) {
    // merge new source with current pkg content
    const update = super.prepare(s, t)

    // move comment to config field
    const configKey = this.options.options.configKey
    const header = this.header()
    const headerKey = Object.keys(header)[0]
    update[configKey] = setFirst(header, update[configKey])
    delete update[headerKey]
    delete update[configKey][`//${headerKey}`]

    return update
  }

  async write (s) {
    const pkg = await NpmPackageJson.load(dirname(this.target))
    pkg.update(s)
    traverse(pkg.content, (keys, value) => {
      if (value === this.constructor.DELETE) {
        return unset(pkg.content, keys)
      }
    })
    await pkg.save()
  }
}

class Esbuild extends Js {
  // these diffs are too big to show, so this will only display
  // that the file needs to be updated or not
  static diff = null
  static build = {
    logLevel: 'silent',
    platform: 'node',
    write: false,
    target: 'node16', // this targets github actions which uses node@16
  }

  parse (s) {
    const res = esbuild.buildSync({
      stdin: {
        contents: s,
        resolveDir: dirname(this.source),
      },
      bundle: true,
      ...this.constructor.build,
    })

    if (res.errors.length) {
      throw new Error(JSON.stringify(res.errors, null, 2))
    }

    return res.outputFiles[0].text
  }
}

const Parsers = {
  Base,
  Gitignore,
  Js,
  Ini,
  IniMerge,
  Markdown,
  Yml,
  YmlMerge,
  PackageJson,
  Json,
  JsonMerge,
  Esbuild,
}

const parserLookup = Object.values(Parsers)

const getParser = (file) => {
  const parsers = parserLookup
    .map(p => {
      const type = p.types.find(t => minimatch(file, `**/${t}`, { nocase: true }))
      if (type) {
        return { parser: p, type }
      }
    })
    .filter(Boolean)

  const noMagicParser = parsers.find(p => !p.type.includes('*'))

  return noMagicParser?.parser || parsers[0]?.parser || Parsers.Base
}

module.exports = getParser
module.exports.Parsers = Parsers
