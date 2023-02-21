const fs = require('fs/promises')
const { dirname, relative, join } = require('path')
const { merge, mergeWithArrays, strDiff, template, mergeWithCustomizer } = require('./util')
const { has, identity } = require('lodash')

const noEntOk = (code) => (error) => {
  if (error.code === 'ENOENT') {
    return null
  }
  return Object.assign(error, { code })
}

const CACHE = new Map()

class Parser {
  static DELETE = '__DELETE__'

  #parserRule

  constructor (target, source, { cache = true, ...options } = {}) {
    if (!cache) {
      CACHE.clear()
    }

    this.target = target
    this.#state.count++
    this.#parserRule = options.rule.parser ?? {}
    this.source = source
    this.data = options.data
    this.options = {
      ...options,
      target,
      source,
      state: this.#state,
    }
  }

  #setDefaultProp (key, def) {
    if (has(this.#parserRule, key)) {
      this[key] = this.#parserRule[key]
    } else if (this[key] === undefined) {
      this[key] = def
    }
  }

  #setDefaultProps () {
    this.parserOptions = merge(this.parserOptions, this.#parserRule.options)
    this.#setDefaultProp('diff', true)
    this.#setDefaultProp('template', true)
    this.#setDefaultProp('clean', false)
    this.#setDefaultProp('stringify', identity)
    this.#setDefaultProp('format', identity)
    this.#setDefaultProp('parse', identity)
    this.#setDefaultProp('setHeader', identity)
    this.#setDefaultProp('merge', false)
    this.#setDefaultProp('comment')
  }

  get #state () {
    if (!CACHE.has(this.target)) {
      CACHE.set(this.target, { count: 0 })
    }
    return CACHE.get(this.target)
  }

  get header () {
    if (!this.comment) {
      return undefined
    }
    const h = this.#template(this.merge
      ? 'This file is partially updated by {$ options.name $}. Edits may be overwritten.'
      : 'This file is automatically updated by {$ options.name $}. Do not edit.')
    return typeof this.comment === 'function'
      ? this.comment(h)
      : `${this.comment} ${h}`
  }

  #template (s) {
    if (this.template) {
      if (typeof this.template === 'function') {
        return this.template(s)
      }
      return template(s, {
        baseDirs: this.options.baseDirs,
        templateOptions: this.parserOptions?.template,
        data: this.data,
        DELETE: Parser.DELETE,
      })
    }
    return s
  }

  #diff (t, s) {
    if (this.diff) {
      const diffRes = typeof this.diff === 'function'
        ? this.diff(t, s)
        : strDiff(t, s, { context: this.parserOptions?.diffContext })
      return typeof diffRes === 'string' ? (diffRes.trim() || true) : diffRes
    }
    return t === s
  }

  #setStringHeader (s) {
    const h = this.header
    return typeof h === 'string' ? `${h}\n\n${s}` : s
  }

  #prepareWrite (s, t) {
    s = this.#merge(s, t)
    s = this.stringify(s)
    s = typeof s === 'string' ? this.#setStringHeader(s) : this.setHeader(s)
    return this.format(s)
  }

  #prepareDiff (s, t) {
    s = this.#prepareWrite(s, t)
    return this.parse(s)
  }

  #merge (s, t) {
    let source = s
    if (this.merge && t) {
      if (typeof this.merge === 'function') {
        source = this.merge(t, source)
      } else if (this.parserOptions?.mergeArrays) {
        source = mergeWithArrays(t, source)
      } else if (this.parserOptions?.mergeCustomizer) {
        source = mergeWithCustomizer(t, source, this.parserOptions?.mergeCustomizer)
      } else {
        source = merge(t, source)
      }
    }
    return source
  }

  async #clean () {
    if (typeof this.clean === 'function') {
      return this.clean(this.target)
    } else if (this.clean && this.#state.count === 1) {
      return fs.rm(this.target).catch(noEntOk())
    }
    return null
  }

  async #read (s) {
    if (s === this.source) {
      // allow shadowing files in configured content directories
      // without needing to add the file to the config explicitly
      const dirs = this.options.baseDirs ?? []
      const relDir = dirs.find(d => s.startsWith(d))
      if (relDir) {
        const relFile = relative(relDir, s)
        for (const dir of dirs) {
          try {
            return await fs.readFile(join(dir, relFile), { encoding: 'utf-8' })
          } catch (err) {
            if (err.code === 'ENOENT') {
              continue
            }
            throw err
          }
        }
      }
    }
    return fs.readFile(s, { encoding: 'utf-8' })
  }

  async write (s) {
    s = s.trim().replace(/\r\n/g, '\n') + '\n'
    await fs.mkdir(dirname(this.target), { recursive: true, force: true })
    await fs.writeFile(this.target, s, { encoding: 'utf-8' })
  }

  async #getTarget () {
    const read = await this.#read(this.target)
    return this.parse(read)
  }

  async #getSource () {
    const read = await this.#read(this.source)
    // replace template vars first, this will throw for nonexistant vars
    // because it must be parseable after this step
    const templated = await this.#template(read)
    // parse into whatever data structure is necessary for maniuplating
    // diffing, merging, etc. by default its a string
    return this.parse(templated)
  }

  async applyWrite () {
    this.#setDefaultProps()

    await this.#clean()
    // prepare the source for writing and diffing, pass in current
    // target for merging. errors parsing or preparing targets are ok here
    const prepared = await this.#prepareWrite(
      await this.#getSource(),
      await this.#getTarget().catch(() => null)
    )
    return this.write(prepared)
  }

  async applyDiff () {
    this.#setDefaultProps()

    // handle if old does not exist
    const targetError = 'ETARGETERROR'
    const target = await this.#getTarget().catch(noEntOk(targetError))

    // no need to diff if current file does not exist
    if (target === null) {
      return null
    }

    // gets the target to diff against in case it needs to merge, etc
    const prepared = await this.#prepareDiff(
      await this.#getSource(),
      target
    )

    // if there was a target error then return false to show that the file
    // is there but needs to be updated. skip showing a diff since it might be huge
    if (target.code === targetError) {
      return false
    }

    // individual diff methods are responsible for returning a string
    // representing the diff. an empty trimmed string means no diff
    return this.#diff(target, prepared)
  }
}

module.exports = Parser
