const t = require('tap')
const fs = require('fs/promises')
const { join } = require('path')
const Base = require('../../lib/rules/files/parser.js')
const parsers = require('../../lib/rules/files/parsers.js')

const NAME = 'THEPARSER'
const CONFIG = 'PARSER_CONFIG'
const header = `This file is automatically updated by ${NAME}. Do not edit.`
const mergeHeader = `This file is partially updated by ${NAME}. Edits may be overwritten.`

const json = (v) => JSON.stringify(v, null, 2) + '\n'

const setup = (t, Parser, testdir = {}, parserOpts = {}) => {
  let targetName = 'target'
  let sourceName = 'source'
  if (Parser === parsers.PackageJson) {
    targetName = 'package.json'
    sourceName = 'pkg.json'
    if (testdir.target) {
      testdir[targetName] = testdir.target
      delete testdir.target
    }
    if (testdir.source) {
      testdir[sourceName] = testdir.source
      delete testdir.source
    }
  }
  const dir = t.testdir(testdir)
  const target = join(dir, targetName)
  const source = join(dir, sourceName)
  const parserOptions = {
    cache: false,
    data: {
      options: {
        name: NAME,
        configKey: CONFIG,
      },
    },
    rule: { parser: parserOpts },
  }
  const parser = new Parser(target, source, parserOptions)
  return {
    parser,
    target,
    source,
    readTarget: () => fs.readFile(target, { encoding: 'utf-8' }),
    dir,
  }
}

const testCases = async (t, cases) => {
  for (const [p, files, expected, opts, name] of cases) {
    const f = Array.isArray(files)
      ? { source: files[0], target: files[1] } : { source: files }
    const testName = name ?? f.source.slice(0, 10)
    await t.test(`${p.name} - ${testName}`, async t => {
      const { parser, readTarget } = setup(t, p, f, opts)
      await parser.applyWrite()
      t.equal(await readTarget(), expected, 'target has expected content')
    })
  }
}

const diffCases = async (t, cases) => {
  for (const [p, files, expected, opts, name] of cases) {
    const f = Array.isArray(files)
      ? { source: files[0], target: files[1] } : { source: files }
    const testName = name ?? f.source.slice(0, 10)
    await t.test(`${p.name} - ${testName}`, async t => {
      const { parser } = setup(t, p, f, opts)
      const res = await parser.applyDiff()
      t.equal(res, expected, 'diff has expected content')
    })
  }
}

t.test('diff', async t => diffCases(t, [
  [Base, 'xyz', null, {}, 'returns null with no target'],
  [parsers.Gitignore,
    ['xyz\n', `# ${header}\n\nxy\n`],
    '@@ -3,1 +3,1 @@\n-xy\n+xyz',
    { options: { diffContext: 0 } },
  ],
  [parsers.Ini,
    ['xyz=true\n', `xyz=false`],
    '"xyz" is false, expected true',
  ],
  [parsers.Yml,
    ['- a: 1\n', `- a: 2`],
    '"0.a" is 2, expected 1',
  ],
  [parsers.Json,
    ['{"a":1,"b":2,"c":{"d":{"e":4}},"z":[1,2]}', `{"a":1,"c":{"d":{"e":5}},"z":[2,3]}`],
    [
      '"b" is missing, expected 2',
      '"c.d.e" is 5, expected 4',
      `"${NAME}" is missing, expected "${header}"`,
      '"z[0]" is 2, expected 1',
      '"z[1]" is 3, expected 2',
    ].join('\n'),
  ],
  [parsers.PackageJson,
    ['{"a":1,"b":2,"c":{"d":{"e":4}},"z":[1,2]}', `{"a":1,"c":{"d":{"e":5}},"z":[2,3]}`],
    [
      '"b" is missing, expected 2',
      '"c.d.e" is 5, expected 4',
      `"${CONFIG}" is missing, expected {`,
      `  "${NAME}": "${mergeHeader}"`,
      '}',
      '"z[0]" is 2, expected 1',
      '"z[1]" is 3, expected 2',
    ].join('\n'),
  ],
  [parsers.Esbuild, ['x', 'y'], false, {}, 'no diff for esbuild'],
]))

t.test('basic', async t => testCases(t, [
  [Base, 'xyz', `xyz\n`],
  [parsers.Gitignore, 'xyz', `# ${header}\n\nxyz\n`],
  [parsers.Js, 'xyz', `/* ${header} */\n\nxyz\n`],
  [parsers.Ini, 'xyz', `; ${header}\n\nxyz=true\n`],
  [parsers.IniMerge, 'xyz', `; ${mergeHeader}\n\nxyz=true\n`],
  [parsers.IniMerge, ['xyz=false', 'abc=false'], `; ${mergeHeader}\n\nabc=false\nxyz=false\n`],
  [parsers.Markdown, 'hello', `<!-- ${header} -->\n\nhello\n`],
  [parsers.Yml, '- a: 123', `# ${header}\n\n- a: 123\n`],
  [parsers.Json, '{"a":1}', json({ [NAME]: header, a: 1 })],
  [parsers.JsonMerge, '{"a":1}', json({ [NAME]: mergeHeader, a: 1 })],
  [parsers.PackageJson, '{  \n"a":1}\n', json({ a: 1, [CONFIG]: { [NAME]: mergeHeader } })],
  [parsers.Esbuild, 'x', `/* ${header} */\n\nx;\n`],
]))

t.test('yaml appending', async t => testCases(t, [
  [parsers.YmlAppend,
    [
      'source: true\nappend:\n  - id: 1\n  - id: 2',
      'target: true\nappend:\n  - id: a\n  - id: b',
    ],
    `# ${mergeHeader}\n\ntarget: true\nappend:\n  - id: a\n  - id: b\n  - id: 1\n  - id: 2\n`,
    { options: { key: 'append', id: 'id' } },
  ],
  [parsers.YmlAppend,
    [
      'source: true\nappend:\n  - id: 1\n  - id: 2',
      'target: true\nappend:\n  - id: a\n  - id: b',
    ],
    `# ${mergeHeader}\n\nsource: true\nappend:\n  - id: 1\n  - id: 2\n`,
    { clean: true, options: { key: 'append', id: 'id' } },
    'appends yaml after initial clean',
  ],
  [parsers.YmlAppend,
    'source: true\nappend:\n  - id: 1\n  - id: 2',
    `# ${mergeHeader}\n\nsource: true\nappend:\n  - id: 1\n  - id: 2\n`,
    { options: { key: 'append', id: 'id' } },
    'uses source yaml with no existing target',
  ],
  [parsers.YmlAppend,
    [
      'source: true\nappend:\n  - id: 1\n  - id: 2',
      'target: true\nnot-append:\n  - id: a\n  - id: b',
    ],
    `# ${mergeHeader}\n\nsource: true\nappend:\n  - id: 1\n  - id: 2\n`,
    { options: { key: 'append' } },
    'uses source yaml when key section does not exist in target',
  ],
  [parsers.YmlAppend,
    [
      'source: true\nnot-append:\n  - id: 1\n  - id: 2',
      'target: true\nnot-append:\n  - id: a\n  - id: b',
    ],
    `# ${mergeHeader}\n\nsource: true\nnot-append:\n  - id: 1\n  - id: 2\n`,
    { options: { key: 'append', id: 'id' } },
    'uses source yaml when key section does not exist in both source and target',
  ],
  [parsers.YmlAppend,
    [
      'source: true\nappend:\n  - id: 1\n    x: 1\n  - id: 2',
      'target: true\nappend:\n  - id: 1\n    a: 1\n  - id: b',
    ],
    `# ${mergeHeader}\n\ntarget: true\nappend:\n  - id: 1\n    x: 1\n  - id: b\n  - id: 2\n`,
    { options: { key: 'append' } },
    'updates by id',
  ],
  [parsers.YmlAppend,
    [
      '- 2\n- 1',
      '- 3\n- 4',
    ],
    `# ${mergeHeader}\n\n- 3\n- 4\n- 2\n- 1\n`,
    {},
    'update root array of primitive values',
  ],
  [class extends parsers.YmlAppend {
    parserOptions = { key: 'append', id: 'id' }
  }, [
    'source: true\nappend:\n  - id: 1\n  - id: 2',
    'target: true\nappend:\n  - id: a\n  - id: b',
  ],
    `# ${mergeHeader}\n\ntarget: true\nappend:\n  - id: a\n  - id: b\n  - id: 1\n  - id: 2\n`,
    {},
    'works when extending with parser options via class field',
  ],
  [class extends parsers.YmlAppend {
    parserOptions = { key: 'append', id: 'id' }
  }, [
    'source: true\nnot-append:\n  - id: 1\n  - id: 2',
    'target: true\nnot-append:\n  - id: a\n  - id: b',
  ],
    `# ${mergeHeader}\n\ntarget: true\nnot-append:\n  - id: a\n  - id: b\n  - id: 1\n  - id: 2\n`,
    { options: { key: 'not-append' } },
    'works when extending with parser options via options',
  ],
]))

t.test('json merge and delete', async t => testCases(t, [
  [parsers.Json,
    `{"a":1,"b":"${Base.DELETE}","c":{"d":1,"e":"${Base.DELETE}"}}`,
    json({ [NAME]: header, a: 1, c: { d: 1 } }),
    {},
    'can delete json properties',
  ],
  [parsers.JsonMerge,
    [
      `{"a":1,"b":{"c":2},"z":[1]}`,
      `{"c":1,"b":{"d":3},"z":[2]}`,
    ],
    json({ [NAME]: mergeHeader, c: 1, b: { d: 3, c: 2 }, z: [1], a: 1 }),
  ],
  [parsers.JsonMerge,
    [
      `{"a":[1,2,3],"b":[1]}`,
      `{"a":["x","y","z"],"c":[1]}`,
    ],
    json({ [NAME]: mergeHeader, a: ['x', 'y', 'z', 1, 2, 3], c: [1], b: [1] }),
    { options: { mergeArrays: true } },
    'can merge arrays with option',
  ],
  [class NoCommentJson extends parsers.JsonMerge {
    clean = true
    comment = null
  },
  [
      `{"a":1,"b":{"c":2},"z":[1]}`,
      `{"c":1,"b":{"d":3},"z":[2]}`,
  ],
  json({ a: 1, b: { c: 2 }, z: [1] }),
  ],
  [parsers.PackageJson,
    [
      `{"a":1,"b":{"c":2},"z":[1]}`,
      `{\n  "c":1,"${CONFIG}":{},"b":{"d":3},"z":[2]}`,
    ],
    json({ c: 1, [CONFIG]: { [NAME]: mergeHeader }, b: { d: 3, c: 2 }, z: [1], a: 1 }),
    {},
    'package json',
  ],
  [parsers.PackageJson,
    [
      `{"a":[1,2,3],"b":[1]}`,
      `{\n  "a":["x","y","z"],"c":[1]}`,
    ],
    json({ a: ['x', 'y', 'z', 1, 2, 3], c: [1], b: [1], [CONFIG]: { [NAME]: mergeHeader } }),
    { options: { mergeArrays: true } },
    'package json can merge arrays',
  ],
  [parsers.PackageJson,
    [
      `{"a":1,"b":"${Base.DELETE}"}`,
      `{\n  "a":2,"b":2}`,
    ],
    json({ a: 1, [CONFIG]: { [NAME]: mergeHeader } }),
    {},
    'package json can delete',
  ],
]))
