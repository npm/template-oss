const isPublic = (p) => p.config.isPublic

const sharedRootAdd = () => ({
  // composite actions
  '.github/actions/audit/action.yml': 'actions/audit.yml',
  '.github/actions/changed-files/action.yml': 'actions/changed-files.yml',
  '.github/actions/changed-workspaces/action.yml': 'actions/changed-workspaces.yml',
  '.github/actions/conclude-check/action.yml': 'actions/conclude-check.yml',
  '.github/actions/create-check/action.yml': 'actions/create-check.yml',
  '.github/actions/deps/action.yml': 'actions/deps.yml',
  '.github/actions/lint/action.yml': 'actions/lint.yml',
  '.github/actions/setup/action.yml': 'actions/setup.yml',
  '.github/actions/test/action.yml': 'actions/test.yml',
  '.github/actions/upsert-comment/action.yml': 'actions/upsert-comment.yml',
  // workflows
  '.github/workflows/audit.yml': 'workflows/audit.yml',
  '.github/workflows/ci.yml': 'workflows/ci.yml',
  '.github/workflows/codeql-analysis.yml': 'workflows/codeql-analysis.yml',
  '.github/workflows/post-dependabot.yml': {
    file: 'workflows/post-dependabot.yml',
  },
  // this lint commits which is only necessary for releases
  '.github/workflows/pull-request.yml': {
    file: 'workflows/pull-request.yml',
    filter: isPublic,
  },
  '.github/workflows/release.yml': {
    file: 'workflows/release.yml',
    filter: isPublic,
  },
  '.github/workflows/release-integration.yml': {
    file: 'workflows/release-integration.yml',
    filter: isPublic,
  },
  // release please config
  '.release-please-manifest.json': {
    file: 'files/release-please-manifest.json',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      static comment = null
    },
  },
  'release-please-config.json': {
    file: 'files/release-please-config.json',
    filter: isPublic,
    parser: (p) => class extends p.JsonMerge {
      static comment = null
    },
  },
  // ci
  '.github/matchers/tap.json': 'files/tap.json',
  // dependabot
  '.github/dependabot.yml': {
    file: 'files/dependabot.yml',
    parser: (p, options) => {
      // dependabot takes a single top level config file. if we are operating on
      // a workspace in a repo without a root lockfile, then this parser will
      // run for all configured packages and each one will have its item
      // replaced in the updates array based on the directory.
      if (options.config.isMono && !options.rootConfig.lockfile) {
        return class extends p.YmlMerge {
          static clean = true
          static key = 'updates'
          static id = 'directory'
        }
      }
      // otherwise, we want only a single dependabot updater which will operate
      // on the root lockfile, even for workspaces. this is to prevent dependabot
      // from opening multiple PRs for each instance of a shared dependency
    },
  },

})

const sharedRootRm = () => ({
  '.github/workflows/pull-request.yml': {
    filter: (p) => p.config.allPrivate,
  },
})

// Changes applied to the root of the repo
const rootRepo = {
  add: {
    '.commitlintrc.js': 'files/commitlintrc.js',
    '.github/ISSUE_TEMPLATE/bug.yml': 'files/bug.yml',
    '.github/ISSUE_TEMPLATE/config.yml': 'files/config.yml',
    '.github/CODEOWNERS': 'files/CODEOWNERS',
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
    '.eslintrc.js': 'files/eslintrc.js',
    '.gitignore': 'files/gitignore',
    '.npmrc': 'files/npmrc',
    'SECURITY.md': 'files/SECURITY.md',
    'CODE_OF_CONDUCT.md': 'files/CODE_OF_CONDUCT.md',
    'package.json': 'files/pkg.json',
  },
  rm: [
    '.eslintrc.!(js|local.*)',
  ],
}

// Changes for each workspace but applied to the root of the repo
const workspaceRepo = {
  add: {
    ...sharedRootAdd(),
  },
  rm: {
    // These are the old release please and ci files that should be removed now
    '.github/workflows/release-please-{{ pkgNameFs }}.yml': true,
    '.github/workflows/ci-{{ pkgNameFs }}.yml': true,
    ...sharedRootRm(),
  },
}

// Changes for each workspace but applied to the relative workspace dir
const workspaceModule = {
  add: {
    '.eslintrc.js': 'files/eslintrc.js',
    '.gitignore': 'files/gitignore',
    'package.json': 'files/pkg.json',
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
  defaultBranch: 'main',
  releaseBranches: ['release/v*'],
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
  org: 'npm',
  codeowner: '@npm/cli-team',
  npm: 'npm',
  npx: 'npx',
  npmSpec: 'latest',
  shell: 'bash',
  runsOn: 'ubuntu-latest',
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
