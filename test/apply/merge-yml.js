const t = require('tap')
const yaml = require('yaml')
const setup = require('../setup.js')

const toYml = (data) => new yaml.Document(data).toString()

t.test('json merge', async (t) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        content: 'content',
        defaultContent: false,
      },
    },
    testdir: {
      'target.yml': toYml({
        existing: 'header',
        key: [
          { id: 1, a: 1 },
          { id: 2, a: 2 },
          { noid: 1 },
        ],
      }),
      'clean-target.yml': toYml({
        existing: 'header',
        key: [
          { id: 1, a: 1 },
          { id: 2, a: 2 },
          { noid: 1 },
        ],
      }),
      content: {
        'index.js': await setup.fixture('yml-merge.js'),
        'source.yml': toYml({
          new: 'header',
          key: [
            { id: 1, b: 1 },
            { id: 2, b: 2 },
            { id: 3, b: 3 },
          ],
        }),
      },
    },
  })

  await s.apply()

  t.strictSame(yaml.parse(await s.readFile('target.yml')), {
    existing: 'header',
    key: [
      { id: 1, b: 1 },
      { id: 2, b: 2 },
      { noid: 1 },
      { id: 3, b: 3 },
    ],
  })
  t.strictSame(yaml.parse(await s.readFile('clean-target.yml')), {
    new: 'header',
    key: [
      { id: 1, b: 1 },
      { id: 2, b: 2 },
      { id: 3, b: 3 },
    ],
  })
})
