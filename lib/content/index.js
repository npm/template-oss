const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

const isPublic = (p) => !p.pkg.private

const sharedRoot = (name) => ({
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
  // ci
  '.github/matchers/tap.json': 'tap.json',
  [`.github/workflows/ci${name ? `-${name}` : ''}.yml`]: 'ci.yml',
  // dependabot
  '.github/dependabot.yml': {
    file: 'dependabot.yml',
    clean: (p) => p.config.isRoot,
    // dependabot takes a single top level config file. this parser
    // will run for all configured packages and each one will have
    // its item replaced in the updates array based on the directory
    parser: (p) => class extends p.YmlMerge {
      key = 'updates'
      id = 'directory'
    },
  },
  '.github/workflows/post-dependabot.yml': {
    file: 'post-dependabot.yml',
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
    '.github/workflows/pull-request.yml': 'pull-request.yml',
    ...sharedRoot(),
  },
  rm: [
    '.github/workflows/release-test.yml',
    '.github/workflows/release-please.yml',
  ],
}

// These are also applied to the root of the repo
// but can by controlled by the `rootModule` config
// XXX: im not sure the distinction between repo
// and module in the root. both are applied to the same
// dir. so we might want to combine these
const rootModule = {
  add: {
    '.eslintrc.js': 'eslintrc.js',
    '.gitignore': 'gitignore',
    '.npmrc': 'npmrc',
    'SECURITY.md': 'SECURITY.md',
    'CODE_OF_CONDUCT.md': 'CODE_OF_CONDUCT.md',
    'package.json': 'pkg.json',
  },
  rm: [
    '.eslintrc.!(js|local.*)',
  ],
}

// Changes for each workspace but applied to the root of the repo
const workspaceRepo = {
  add: {
    ...sharedRoot('{{ pkgNameFs }}'),
  },
  rm: [
    // These are the old release please files that should be removed now
    '.github/workflows/release-please-{{ pkgNameFs }}.yml',
  ],
}

// Changes for each workspace but applied to the relative workspace dir
const workspaceModule = {
  add: {
    '.eslintrc.js': 'eslintrc.js',
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
  releaseBranches: [],
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
  npm: 'npm',
  npx: 'npx',
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
