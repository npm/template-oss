const t = require('tap')
const yaml = require('yaml')
const setup = require('../setup.js')

const setupDependabot = async (t, { branches = ['main'], ...config } = {}) => {
  const s = await setup(t, {
    package: {
      templateOSS: {
        ...config,
        // Include branches in the templateOSS config so they get processed
        branches: branches.length > 1 ? branches : undefined,
      },
    },
    mocks: {
      '@npmcli/git': {
        is: async () => true,
        spawn: async args => {
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

  const postDependabot = await s.readFile('.github/workflows/post-dependabot.yml').catch(() => false)
  const dependabot = await s
    .readFile('.github/dependabot.yml')
    .then(r => yaml.parse(r).updates)
    .catch(() => false)

  return {
    ...s,
    dependabot,
    postDependabot,
  }
}

t.test('default', async t => {
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
    'open-pull-requests-limit': 10,
  })

  t.ok(s.postDependabot)
})

t.test('change strategy', async t => {
  const s = await setupDependabot(t, {
    dependabot: 'some-other-strategy',
  })

  t.equal(s.dependabot[0]['versioning-strategy'], 'some-other-strategy')
})

t.test('turn off specific branch', async t => {
  const s = await setupDependabot(t, {
    dependabot: {
      main: false,
    },
  })
  t.equal(s.dependabot, null)
})

t.test('release brancheses', async t => {
  const s = await setupDependabot(t, {
    branches: ['release/v10'],
  })

  t.match(s.dependabot[0], {
    'target-branch': 'release/v10',
    allow: [
      {
        'dependency-type': 'direct',
        'dependency-name': '@npmcli/template-oss',
      },
    ],
    labels: ['Dependencies', 'Backport', 'release/v10'],
  })
})

t.test('no dependabot', async t => {
  const s = await setupDependabot(t, {
    dependabot: false,
  })
  t.equal(s.dependabot, false)
  t.equal(s.postDependabot, false)
})

t.test('custom interval', async t => {
  const s = await setupDependabot(t, {
    dependabotInterval: 'weekly',
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'weekly' },
  })
})

t.test('branch-specific interval', async t => {
  const s = await setupDependabot(t, {
    dependabot: {
      main: { interval: 'monthly' },
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'monthly' },
  })
})

t.test('mixed interval configuration', async t => {
  const s = await setupDependabot(t, {
    branches: ['main', 'develop'],
    dependabotInterval: 'weekly',
    dependabot: {
      main: { interval: 'monthly' },
    },
  })

  t.equal(s.dependabot.length, 2)

  // main branch should use branch-specific interval
  const mainBranch = s.dependabot.find(d => d['target-branch'] === 'main')
  t.match(mainBranch, {
    schedule: { interval: 'monthly' },
  })

  // develop branch should use global interval
  const developBranch = s.dependabot.find(d => d['target-branch'] === 'develop')
  t.match(developBranch, {
    schedule: { interval: 'weekly' },
  })
})

t.test('branch-specific interval with strategy', async t => {
  const s = await setupDependabot(t, {
    dependabot: {
      main: { interval: 'weekly', strategy: 'auto' },
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'weekly' },
    'versioning-strategy': 'auto',
  })
})

t.test('global interval with branch-specific strategy only', async t => {
  const s = await setupDependabot(t, {
    dependabotInterval: 'monthly',
    dependabot: {
      main: { strategy: 'lockfile-only' },
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'monthly' },
    'versioning-strategy': 'lockfile-only',
  })
})

t.test('fallback to daily when no interval specified', async t => {
  const s = await setupDependabot(t, {
    dependabot: 'increase-if-necessary',
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'daily' },
    'versioning-strategy': 'increase-if-necessary',
  })
})

t.test('mixed branches with some having interval and some not', async t => {
  const s = await setupDependabot(t, {
    branches: ['main', 'develop', 'staging'],
    dependabotInterval: 'weekly',
    dependabot: {
      main: { interval: 'monthly' },
      develop: { strategy: 'auto' },
      // staging gets global interval
    },
  })

  t.equal(s.dependabot.length, 3)

  const mainBranch = s.dependabot.find(d => d['target-branch'] === 'main')
  t.match(mainBranch, {
    schedule: { interval: 'monthly' },
  })

  const developBranch = s.dependabot.find(d => d['target-branch'] === 'develop')
  t.match(developBranch, {
    schedule: { interval: 'weekly' },
    'versioning-strategy': 'auto',
  })

  const stagingBranch = s.dependabot.find(d => d['target-branch'] === 'staging')
  t.match(stagingBranch, {
    schedule: { interval: 'weekly' },
  })
})

t.test('empty branch config falls back to global interval', async t => {
  const s = await setupDependabot(t, {
    dependabotInterval: 'monthly',
    dependabot: {
      main: {}, // empty object should fall back to global interval
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'monthly' },
  })
})

t.test('no package interval and no branch interval falls back to default', async t => {
  const s = await setupDependabot(t, {
    // no dependabotInterval at package level
    dependabot: {
      main: {}, // empty object, no interval
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'daily' }, // should fall back to default
  })
})

t.test('branch config as string without interval falls back properly', async t => {
  const s = await setupDependabot(t, {
    // no dependabotInterval at package level
    dependabot: {
      main: 'auto', // string config, no interval property
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'daily' }, // should fall back to default
    'versioning-strategy': 'auto',
  })
})

t.test('falsy package interval and no branch interval falls back to default', async t => {
  const s = await setupDependabot(t, {
    dependabotInterval: null, // explicitly falsy
    dependabot: {
      main: {}, // empty object, no interval
    },
  })

  t.match(s.dependabot[0], {
    schedule: { interval: 'daily' }, // should fall back to default
  })
})
