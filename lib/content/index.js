const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

const isPublic = p => p.config.isPublic

const sharedRootAdd = name => ({
  // release
  '.github/workflows/release.yml': {
    file: 'release-yml.hbs',
    filter: isPublic,
  },
  '.github/workflows/ci-release.yml': {
    file: 'ci-release-yml.hbs',
    filter: isPublic,
  },
  '.github/workflows/release-integration.yml': {
    file: 'release-integration-yml.hbs',
    filter: isPublic,
  },
  '.release-please-manifest.json': {
    file: 'release-please-manifest-json.hbs',
    filter: isPublic,
    parser: p => p.JsonMergeNoComment,
  },
  'release-please-config.json': {
    file: 'release-please-config-json.hbs',
    filter: isPublic,
    parser: p => p.JsonMergeNoComment,
  },
  'tsconfig.json': {
    file: 'tsconfig-json.hbs',
    filter: p => p.config.typescript || p.config.jsdoc,
    parser: p => p.JsonMergeNoComment,
  },
  // this lint commits which is only necessary for releases
  '.github/workflows/pull-request.yml': {
    file: 'pull-request-yml.hbs',
    filter: isPublic,
  },
  // ci
  '.github/matchers/tap.json': {
    file: 'tap-json.hbs',
    filter: p => !p.config.isNodeTest,
  },
  [`.github/workflows/ci${name ? `-${name}` : ''}.yml`]: 'ci-yml.hbs',
  // dependabot
  '.github/dependabot.yml': {
    file: 'dependabot-yml.hbs',
    filter: p => p.config.dependabot,
  },
  '.github/workflows/post-dependabot.yml': {
    file: 'post-dependabot-yml.hbs',
    filter: p => p.config.dependabot,
  },
  '.github/settings.yml': {
    file: 'settings-yml.hbs',
    filter: p => !p.config.isReleaseBranch,
  },
  // composite actions
  '.github/actions/install-latest-npm/action.yml': 'action-install-latest-npm-yml.hbs',
  '.github/actions/create-check/action.yml': 'action-create-check-yml.hbs',
})

const sharedRootRm = () => ({
  '.github/workflows/pull-request.yml': {
    filter: p => p.config.allPrivate,
  },
  '.github/settings.yml': {
    filter: p => p.config.isReleaseBranch,
  },
})

// Changes applied to the root of the repo
const rootRepo = {
  add: {
    '.commitlintrc.{{ cjsExt }}': 'commitlintrc-js.hbs',
    '.github/ISSUE_TEMPLATE/bug.yml': 'bug-yml.hbs',
    '.github/ISSUE_TEMPLATE/config.yml': 'config-yml.hbs',
    '.github/CODEOWNERS': 'CODEOWNERS.hbs',
    '.github/workflows/audit.yml': 'audit-yml.hbs',
    '.github/workflows/codeql-analysis.yml': 'codeql-analysis-yml.hbs',
    ...sharedRootAdd(),
  },
  rm: {
    '.commitlintrc.{{ deleteJsExt }}': true,
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
    '.eslintrc.{{ cjsExt }}': {
      file: 'eslintrc-js.hbs',
      filter: p => p.config.eslint,
    },
    '.prettierrc.{{ cjsExt }}': {
      file: 'prettier-js.hbs',
      filter: p => p.config.prettier,
    },
    '.prettierignore': {
      file: 'prettierignore.hbs',
      filter: p => p.config.prettier,
    },
    '.gitignore': 'gitignore.hbs',
    '.npmrc': 'npmrc.hbs',
    'SECURITY.md': 'SECURITY-md.hbs',
    'CODE_OF_CONDUCT.md': 'CODE_OF_CONDUCT-md.hbs',
    'CONTRIBUTING.md': 'CONTRIBUTING-md.hbs',
    'package.json': 'package-json.hbs',
  },
  rm: ['.eslintrc.!({{ cjsExt }}|local.*)'],
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
    '.eslintrc.{{ cjsExt }}': {
      file: 'eslintrc-js.hbs',
      filter: p => p.config.eslint,
    },
    '.gitignore': 'gitignore.hbs',
    'package.json': 'package-json.hbs',
  },
  rm: ['.npmrc', '.eslintrc.!({{ cjsExt }}|local.*)', 'SECURITY.md'],
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
  // this tag will be used for publishing when not prerelease or backport. use
  // {{major}} to have the major version being published replaced in the string.
  defaultPublishTag: 'latest',
  releaseBranch: 'release/v*',
  distPaths: ['bin/', 'lib/'],
  allowDistPaths: true,
  allowPaths: [
    '/.eslintrc.local.*',
    '/.eslint.config.js',
    '**/.gitignore',
    '/docs/',
    '/tap-snapshots/',
    '/test/',
    '/map.js',
    '/scripts/',
    '/README*',
    '/LICENSE*',
    '/CHANGELOG*',
    '/.git-blame-ignore-revs',
  ],
  ignorePaths: ['tap-testdir*/'],
  lintIgnorePaths: [
    // can be set by consumer
  ],
  lintExtensions: ['js', 'cjs', 'ts', 'mjs', 'jsx', 'tsx'],
  formatIgnorePaths: ['tap-snapshots/', 'test/fixtures/**/*.json'],
  formatExtensions: ['js', 'cjs', 'ts', 'mjs', 'jsx', 'tsx', 'json'],
  ciVersions: {},
  latestCiVersion: 22,
  lockfile: false,
  codeowner: '@npm/cli-team',
  eslint: true,
  prettier: false,
  publish: false,
  typescript: false,
  esm: false,
  testRunner: 'tap',
  updateNpm: true,
  dependabot: 'increase-if-necessary',
  dependabotInterval: 'daily',
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
    devDependencies: [`${NAME}@${LATEST_VERSION}`, '@npmcli/eslint-config', 'tap'],
  },
  allowedPackages: [],
  changelogTypes: [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'docs', section: 'Documentation', hidden: false },
    { type: 'deps', section: 'Dependencies', hidden: false },
    { type: 'chore', section: 'Chores', hidden: true },
  ],
}
