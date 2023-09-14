const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

const isPublic = (p) => p.config.isPublic

const sharedRootAdd = (name) => ({
  // release
  '.github/workflows/release.yml': {
    file: 'release.yml.handlebars',
    filter: isPublic,
  },
  '.github/workflows/ci-release.yml': {
    file: 'ci-release.yml.handlebars',
    filter: isPublic,
  },
  '.release-please-manifest.json': {
    file: 'release-please-manifest.json.handlebars',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      comment = null
    },
  },
  'release-please-config.json': {
    file: 'release-please-config.json.handlebars',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      comment = null
    },
  },
  // this lint commits which is only necessary for releases
  '.github/workflows/pull-request.yml': {
    file: 'pull-request.yml.handlebars',
    filter: isPublic,
  },
  // ci
  '.github/matchers/tap.json': 'tap.json.handlebars',
  [`.github/workflows/ci${name ? `-${name}` : ''}.yml`]: 'ci.yml.handlebars',
  // dependabot
  '.github/dependabot.yml': {
    file: 'dependabot.yml.handlebars',
    filter: (p) => p.config.dependabot,
  },
  '.github/workflows/post-dependabot.yml': {
    file: 'post-dependabot.yml.handlebars',
    filter: (p) => p.config.dependabot,
  },
  '.github/settings.yml': {
    file: 'settings.yml.handlebars',
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
    '.commitlintrc.js': 'commitlintrc.js.handlebars',
    '.github/ISSUE_TEMPLATE/bug.yml': 'bug.yml.handlebars',
    '.github/ISSUE_TEMPLATE/config.yml': 'config.yml.handlebars',
    '.github/CODEOWNERS': 'CODEOWNERS.handlebars',
    '.github/workflows/audit.yml': 'audit.yml.handlebars',
    '.github/workflows/codeql-analysis.yml': 'codeql-analysis.yml.handlebars',
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
      file: 'eslintrc.js.handlebars',
      filter: (p) => p.config.eslint,
    },
    '.gitignore': 'gitignore.handlebars',
    '.npmrc': 'npmrc.handlebars',
    'SECURITY.md': 'SECURITY.md.handlebars',
    'CODE_OF_CONDUCT.md': 'CODE_OF_CONDUCT.md.handlebars',
    'CONTRIBUTING.md': 'CONTRIBUTING.md.handlebars',
    'package.json': 'pkg.json.handlebars',
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
      file: 'eslintrc.js.handlebars',
      filter: (p) => p.config.eslint,
    },
    '.gitignore': 'gitignore.handlebars',
    'package.json': 'pkg.json.handlebars',
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
  // set this to the major version to backport
  backport: null,
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
  ignorePaths: [
    /* to be provided by consuming package */
  ],
  ciVersions: {},
  latestCiVersion: 20,
  lockfile: false,
  codeowner: '@npm/cli-team',
  eslint: true,
  publish: false,
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
