const { name: NAME, version: LATEST_VERSION } = require('../../package.json')

// Changes applied to the root of the repo
const rootRepo = {
  add: {
    '.commitlintrc.js': 'commitlintrc.js',
    '.github/workflows/ci.yml': 'ci.yml',
    '.github/ISSUE_TEMPLATE/bug.yml': 'bug.yml',
    '.github/ISSUE_TEMPLATE/config.yml': 'config.yml',
    '.github/CODEOWNERS': 'CODEOWNERS',
    '.github/dependabot.yml': 'dependabot.yml',
    '.github/workflows/audit.yml': 'audit.yml',
    '.github/workflows/codeql-analysis.yml': 'codeql-analysis.yml',
    '.github/workflows/post-dependabot.yml': 'post-dependabot.yml',
    '.github/workflows/pull-request.yml': 'pull-request.yml',
    '.github/workflows/release-please.yml': 'release-please.yml',
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
    'package.json': 'pkg.json',
  },
  rm: [
    '.eslintrc.!(js|local.*)',
  ],
}

// Changes for each workspace but applied to the root of the repo
const workspaceRepo = {
  add: {
    '.github/workflows/release-please-{{pkgNameFs}}.yml': {
      file: 'release-please.yml',
      filter: (o) => !o.pkg.private,
    },
    '.github/workflows/ci-{{pkgNameFs}}.yml': 'ci.yml',
  },
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
  distPaths: ['bin/', 'lib/'],
  ciVersions: ['12.13.0', '12.x', '14.15.0', '14.x', '16.0.0', '16.x'],
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
