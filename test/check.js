const t = require('tap')

const check = require('../lib/check.js')
const { changes } = require('../lib/package')
const { name } = require('../package.json')

const normalizeSnapshot = (problems) => {
  return problems.map((p) => {
    if (p.message) {
      p.message = p.message.replace(
        /("templateVersion" Expected: ").*(" Found)/g,
        '$1$TEMPLATE_VERSION$2'
      )
    }
    return p
  })
}

t.test('checks a package.json', (t) => {
  t.plan(5)

  t.test('missing fields', async (t) => {
    const project = t.testdir({
      'package.json': '{}',
    })

    const problems = await check(project)
    t.matchSnapshot(normalizeSnapshot(problems), 'problems')
    t.equal(problems.length, 1)
  })

  t.test('incorrect fields', async (t) => {
    const project = t.testdir({
      'package.json': JSON.stringify({
        license: 'MIT',
      }),
    })

    const problems = await check(project)
    t.matchSnapshot(normalizeSnapshot(problems), 'problems')
    t.equal(problems.length, 1)
  })

  t.test('incorrect object fields', async (t) => {
    const project = t.testdir({
      'package.json': JSON.stringify({
        scripts: {},
      }),
    })

    const problems = await check(project)
    t.matchSnapshot(normalizeSnapshot(problems), 'problems')
    t.equal(problems.length, 1)
  })

  t.test('unwanted deps', async (t) => {
    const project = t.testdir({
      'package.json': JSON.stringify({
        dependencies: {
          ...check.unwantedPackages.reduce((acc, k) => {
            acc[k] = '1'
            return acc
          }, {}),
        },
      }),
    })

    const problems = await check(project)
    t.matchSnapshot(normalizeSnapshot(problems), 'problems')
    t.equal(problems.length, 2)
  })

  t.test('unwanted deps', async (t) => {
    const project = t.testdir({
      'package.json': JSON.stringify(changes),
    })

    const problems = await check(project)
    t.matchSnapshot(normalizeSnapshot(problems), 'problems')
    t.equal(problems.length, 0)
  })

  t.end()
})

t.test('this repo doesnt get version', async (t) => {
  const pkg = {
    ...changes,
    name,
  }

  delete pkg.templateVersion

  const project = t.testdir({
    'package.json': JSON.stringify(pkg),
  })

  const needsAction = await check(project)
  t.same(needsAction, [])
})
