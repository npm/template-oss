const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

const releasePlease = () => ({
  '.github/workflows/release-please.yml': {
    file: 'release-please.yml',
    filter: (o) => !o.pkg.private,
  },
  '.github/workflows/release-test.yml': {
    file: 'release-test.yml',
    filter: (o) => !o.pkg.private && o.config.releaseTest === 'release-test.yml',
  },
  '.release-please-manifest.json': {
    file: 'release-please-manifest.json',
    filter: (o) => !o.pkg.private,
    parser: (p) => class NoCommentJson extends p.JsonMerge {
      comment = null
    },
  },
  'release-please-config.json': {
    file: 'release-please-config.json',
    filter: (o) => !o.pkg.private,
    parser: (p) => class NoCommentJson extends p.JsonMerge {
      comment = null
    },
  },
})

// Changes applied to the root of the repo
const rootRepo = {
  add: {
    '.commitlintrc.js': 'commitlintrc.js',
    '.github/workflows/ci.yml': 'ci.yml',
    '.github/ISSUE_TEMPLATE/bug.yml': 'bug.yml',
    '.github/ISSUE_TEMPLATE/config.yml': 'config.yml',
    '.github/CODEOWNERS': 'CODEOWNERS',
    '.github/dependabot.yml': 'dependabot.yml',
    '.github/matchers/tap.json': 'tap.json',
    '.github/workflows/audit.yml': 'audit.yml',
    '.github/workflows/codeql-analysis.yml': 'codeql-analysis.yml',
    '.github/workflows/post-dependabot.yml': 'post-dependabot.yml',
    '.github/workflows/pull-request.yml': 'pull-request.yml',
    ...releasePlease(),
  },
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
    ...releasePlease(true),
    '.github/matchers/tap.json': 'tap.json',
    '.github/workflows/ci-{{pkgNameFs}}.yml': 'ci.yml',
  },
  rm: [
    // These are the old release please files that should be removed now
    '.github/workflows/release-please-{{pkgNameFs}}.yml',
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
  branches: ['main', 'latest'],
  releaseBranches: [],
  defaultBranch: 'main',
  // Escape hatch since we write a release test file but the
  // CLI has a very custom one we dont want to overwrite. This
  // setting allows us to call a workflow by any name during release
  releaseTest: 'release-test.yml',
  distPaths: ['bin/', 'lib/'],
  ciVersions: ['14.17.0', '14.x', '16.13.0', '16.x', '18.0.0', '18.x'],
  lockfile: false,
  npmBin: 'npm',
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
