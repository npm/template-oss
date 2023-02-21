const { dirname } = require('path')
const yaml = require('yaml')
const NpmPackageJson = require('@npmcli/package-json')
const { unset } = require('lodash')
const ini = require('ini')
const esbuild = require('esbuild')
const prettier = require('prettier')
const Base = require('./parser')
const { jsonDiff, jsonStringify, jsonParse, setFirst, jsonDelete } = require('./util')

class Gitignore extends Base {
  comment = '#'
}

class Js extends Base {
  comment = (c) => `/* ${c} */`

  stringify (s) {
    return prettier.format(s, {
      semi: false,
      singleQuote: true,
      printWidth: 100,
      parser: 'babel',
    })
  }
}

class Ini extends Base {
  comment = ';'

  parse (s) {
    return ini.parse(s)
  }

  diff (a, b) {
    return jsonDiff(a, b, this.constructor.DELETE)
  }

  stringify (s) {
    return ini.stringify(s)
  }
}

class IniMerge extends Ini {
  merge = true
}

class Markdown extends Base {
  comment = (c) => `<!-- ${c} -->`

  stringify (s) {
    return prettier.format(s, {
      proseWrap: 'never',
      parser: 'markdown',
    })
  }
}

class Yml extends Base {
  comment = '#'

  diff (a, b) {
    return jsonDiff(a.toJSON(), b.toJSON(), this.constructor.DELETE)
  }

  parse (s) {
    return yaml.parseDocument(s)
  }

  setHeader (s) {
    s.commentBefore = this.header.replace(this.comment, '')
    return s
  }

  format (s) {
    return prettier.format(s.toString({ lineWidth: 0, indent: 2 }), {
      printWidth: 100,
      parser: 'yaml',
    })
  }
}

class YmlAppend extends Yml {
  merge (target, source) {
    const { parserOptions: { key = [], id = 'id' } } = this
    const keys = [].concat(key)

    const getId = (node) => {
      if (node.items) {
        const index = node.items.findIndex(p => p.key?.value === id)
        return index !== -1 ? node.items[index].value?.value : node.toJSON()
      }
      return node.value
    }

    const targetNodes = target.getIn(keys)?.items.reduce((acc, node, index) => {
      acc[getId(node)] = { node, index }
      return acc
    }, {})

    if (!targetNodes) {
      return source
    }

    const sourceNodes = source.getIn(keys)?.items

    if (sourceNodes) {
      for (const node of sourceNodes) {
        if (targetNodes) {
          const index = targetNodes[getId(node)]?.index
          if (typeof index === 'number' && index !== -1) {
            target.setIn([...keys, index], node)
          } else {
            target.addIn(keys, node)
          }
        }
      }
    }

    target.commentBefore = source.commentBefore
    return target
  }
}

class Json extends Base {
  // its a json comment! not really but we do add a special key to json objects
  comment (c) {
    return { [this.data.options.name]: c }
  }

  setHeader (s) {
    return setFirst(s, this.header)
  }

  diff (a, b) {
    return jsonDiff(a, b, this.constructor.DELETE)
  }

  parse (s) {
    return jsonParse(s)
  }

  format (s) {
    return jsonStringify(s, this.constructor.DELETE)
  }
}

class JsonMerge extends Json {
  merge = true
}

class PackageJson extends JsonMerge {
  setHeader (s) {
    const { configKey, name } = this.data.options
    s[configKey] = super.setHeader(s[configKey])
    unset(s, [configKey, `//${name}`])
    return s
  }

  format (s) {
    return jsonStringify(s)
  }

  async write (s) {
    s = this.parse(s)
    const pkg = await NpmPackageJson.load(dirname(this.target)).catch(() => null)
    if (!pkg) {
      return super.write(super.format(s))
    }
    pkg.update(s)
    jsonDelete(pkg.content, this.constructor.DELETE)
    await pkg.save()
  }
}

class Esbuild extends Js {
  // these diffs are too big to show, so this will only display
  // that the file needs to be updated or not
  diff = null

  stringify (v) {
    return v
  }

  parse (s) {
    const res = esbuild.buildSync({
      stdin: {
        contents: s,
        resolveDir: dirname(this.source),
      },
      minify: true,
      bundle: true,
      logLevel: 'silent',
      platform: 'node',
      write: false,
      target: 'node16', // this targets github actions which uses node@16
      ...this.parserOptions?.esbuild,
    })

    if (res.errors.length) {
      throw new Error(JSON.stringify(res.errors, null, 2))
    }

    return res.outputFiles[0].text
  }
}

module.exports = {
  Gitignore,
  Js,
  Ini,
  IniMerge,
  Markdown,
  Yml,
  YmlAppend,
  PackageJson,
  Json,
  JsonMerge,
  Esbuild,
}
