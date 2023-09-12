const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

const isPublic = (p) => p.config.isPublic

const sharedRootAdd = (name) => ({
  // release
  '.github/workflows/release.yml': {
    file: 'release.yml',
    filter: isPublic,
  },
  '.github/workflows/ci-release.yml': {
    file: 'ci-release.yml',
    filter: isPublic,
  },
  '.release-please-manifest.json': {
    file: 'release-please-manifest.json',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      comment = null
    },
  },
  'release-please-config.json': {
    file: 'release-please-config.json',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      comment = null
    },
  },
  // this lint commits which is only necessary for releases
  '.github/workflows/pull-request.yml': {
    file: 'pull-request.yml',
    filter: isPublic,
  },
  // ci
  '.github/matchers/tap.json': 'tap.json',
  [`.github/workflows/ci${name ? `-${name}` : ''}.yml`]: 'ci.yml',
  // dependabot
  '.github/dependabot.yml': {
    file: 'dependabot.yml',
    filter: (p) => p.config.dependabot,
  },
  '.github/workflows/post-dependabot.yml': {
    file: 'post-dependabot.yml',
    filter: (p) => p.config.dependabot,
  },
  '.github/settings.yml': {
    file: 'settings.yml',
    filter: (p) => !p.config.isReleaseBranch,
  },
})

const sharedRootRm = () => ({
  '.github/workflows/pull-request.yml': {
    filter: (p) => p.config.allPrivate,
  },
  '.github/settings.yml': {
    filter: (p) => p.config.isReleaseBranch,
  },
})

// Changes applied to the root of the repo
const rootRepo = {
  add: {
    '.commitlintrc.js': 'commitlintrc.js',
    '.github/ISSUE_TEMPLATE/bug.yml': 'bug.yml',
    '.github/ISSUE_TEMPLATE/config.yml': 'config.yml',
    '.github/CODEOWNERS': 'CODEOWNERS',
    '.github/workflows/audit.yml': 'audit.yml',
    '.github/workflows/codeql-analysis.yml': 'codeql-analysis.yml',
    ...sharedRootAdd(),
  },
  rm: {
    '.github/workflows/release-test.yml': true,
    '.github/workflows/release-please.yml': true,
    ...sharedRootRm(),
  },
}

// These are also applied to the root of the repo
// but can by controlled by the `rootModule` config
// XXX: im not sure the distinction between repo
// and module in the root. both are applied to the same
// dir. so we might want to combine these
const rootModule = {
  add: {
    '.eslintrc.js': {
      file: 'eslintrc.js',
      filter: (p) => p.config.eslint,
    },
    '.gitignore': 'gitignore',
    '.npmrc': 'npmrc',
    'SECURITY.md': 'SECURITY.md',
    'CODE_OF_CONDUCT.md': 'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md': 'CONTRIBUTING.md',
    'package.json': 'pkg.json',
  },
  rm: [
    '.eslintrc.!(js|local.*)',
  ],
}

// Changes for each workspace but applied to the root of the repo
const workspaceRepo = {
  add: {
    ...sharedRootAdd('{{ pkgNameFs }}'),
  },
  rm: {
    // These are the old release please files that should be removed now
    '.github/workflows/release-please-{{ pkgNameFs }}.yml': true,
    ...sharedRootRm(),
  },
}

// Changes for each workspace but applied to the relative workspace dir
const workspaceModule = {
  add: {
    '.eslintrc.js': {
      file: 'eslintrc.js',
      filter: (p) => p.config.eslint,
    },
    '.gitignore': 'gitignore',
    'package.json': 'pkg.json',
  },
  rm: [
    '.npmrc',
    '.eslintrc.!(js|local.*)',
    'SECURITY.md',
  ],
}

module.exports = {
  rootRepo,
  rootModule,
  workspaceRepo,
  workspaceModule,
  windowsCI: true,
  macCI: true,
  branches: ['main', 'latest'],
  releaseBranch: 'release/v*',
  distPaths: [
    'bin/',
    'lib/',
  ],
  allowPaths: [
    '/bin/',
    '/lib/',
    '/.eslintrc.local.*',
    '**/.gitignore',
    '/docs/',
    '/tap-snapshots/',
    '/test/',
    '/map.js',
    '/scripts/',
    '/README*',
    '/LICENSE*',
    '/CHANGELOG*',
  ],
  ignorePaths: [],
  ciVersions: ['14.17.0', '14.x', '16.13.0', '16.x', '18.0.0', '18.x'],
  lockfile: false,
  codeowner: '@npm/cli-team',
  eslint: true,
  publish: false,
  npm: 'npm',
  npx: 'npx',
  updateNpm: true,
  dependabot: 'increase-if-necessary',
  unwantedPackages: [
    'eslint',
    'eslint-plugin-node',
    '@npmcli/lint',
    'eslint-plugin-promise',
    'eslint-plugin-standard',
    'eslint-plugin-import',
    'standard',
  ],
  requiredPackages: {
    devDependencies: [
      `${NAME}@${LATEST_VERSION}`,
      '@npmcli/eslint-config',
      'tap',
    ],
  },
  allowedPackages: [],
  changelogTypes: [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'docs', section: 'Documentation', hidden: false },
    { type: 'deps', section: 'Dependencies', hidden: false },
    { type: 'chore', hidden: true },
  ],
}
