const t = require('tap')
const yaml = require('yaml')
const setup = require('../setup.js')

const setupDependabot = async (t, { branches = ['main'], ...config } = {}) => {
  const s = await setup(t, {
    package: {
      templateOSS: config,
    },
    mocks: {
      '@npmcli/git': {
        is: async () => true,
        spawn: async (args) => {
          const command = args.filter(a => typeof a === 'string').join(' ')
          if (command === 'ls-remote --heads origin') {
            return {
              stdout: branches.map(b => `xxxxx refs/heads/${b}`).join('\n'),
            }
          }
          if (command === 'rev-parse --abbrev-ref HEAD') {
            return {
              stdout: branches[0],
            }
          }
        },
      },
    },
  })
  await s.apply()

  const postDependabot = await s.readFile('.github/workflows/post-dependabot.yml')
    .catch(() => false)
  const dependabot = await s.readFile('.github/dependabot.yml')
    .then(r => yaml.parse(r).updates)
    .catch(() => false)

  return {
    ...s,
    dependabot,
    postDependabot,
  }
}

t.test('default', async (t) => {
  const s = await setupDependabot(t)

  t.equal(s.dependabot.length, 1)
  t.strictSame(s.dependabot[0], {
    'package-ecosystem': 'npm',
    directory: '/',
    schedule: { interval: 'daily' },
    'target-branch': 'main',
    allow: [{ 'dependency-type': 'direct' }],
    'versioning-strategy': 'increase-if-necessary',
    'commit-message': { prefix: 'deps', 'prefix-development': 'chore' },
    labels: ['Dependencies'],
  })

  t.ok(s.postDependabot)
})

t.test('change strategy', async (t) => {
  const s = await setupDependabot(t, {
    dependabot: 'some-other-strategy',
  })

  t.equal(s.dependabot[0]['versioning-strategy'], 'some-other-strategy')
})

t.test('turn off specific branch', async (t) => {
  const s = await setupDependabot(t, {
    dependabot: {
      main: false,
    },
  })
  t.equal(s.dependabot, null)
})

t.test('release brancheses', async (t) => {
  const s = await setupDependabot(t, {
    branches: [
      'release/v10',
    ],
  })

  t.match(s.dependabot[0], {
    'target-branch': 'release/v10',
    allow: [{
      'dependency-type': 'direct',
      'dependency-name': '@npmcli/template-oss',
    }],
    labels: ['Dependencies', 'Backport', 'release/v10'],
  })
})

t.test('no dependabot', async (t) => {
  const s = await setupDependabot(t, {
    dependabot: false,
  })
  t.equal(s.dependabot, false)
  t.equal(s.postDependabot, false)
})
