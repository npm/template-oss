const { data, postData } = require('./data.js')

const isPublic = (o) => o.pkg.isPublic

const isDependabotMerge = (o) => o.repo.isMono && !o.rootPkg.data.lockfile

const releasePleaseConfig = (file) => ({
  file,
  filter: isPublic,
  parser: ({ JsonMerge }) => class extends JsonMerge {
    static clean = true
    static comment = null
  },
})

const jsAction = (dir, file) => ({
  [`.github/actions/${dir}/index.js`]: {
    file,
    parser: ({ Esbuild }) => Esbuild,
  },
  [`.github/actions/${dir}/action.yml`]: {
    file: `${file}/lib/action.yml`,
  },
})

const filesOptions = {
  files: {
    add: {
      '.eslintrc.js': 'files/eslintrc.js',
      '.gitignore': 'files/gitignore',
      'package.json': 'files/pkg.json',
    },
    rm: [
      '.eslintrc.!(js|local.*)',
    ],
  },
  rootFiles: {
    add: {
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
      // js actions
      ...jsAction('release-please', '@npmcli/actions-release-please'),
      ...jsAction('release-manager', '@npmcli/actions-release-manager'),
      ...jsAction('get-workspaces', '@npmcli/actions-get-workspaces'),
      // workflows
      '.github/workflows/audit.yml': 'workflows/audit.yml',
      '.github/workflows/ci.yml': 'workflows/ci.yml',
      '.github/workflows/codeql-analysis.yml': 'workflows/codeql-analysis.yml',
      '.github/workflows/post-dependabot.yml': 'workflows/post-dependabot.yml',
      // // this lint commits which is only necessary for releases
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
      // // release please config
      '.release-please-manifest.json': releasePleaseConfig('files/release-please-manifest.json'),
      'release-please-config.json': releasePleaseConfig('files/release-please-config.json'),
      // ci
      '.github/matchers/tap.json': {
        file: 'files/tap.json',
        parser: ({ Json }) => class extends Json {
          static comment = null
        },
      },
      // dependabot
      // dependabot takes a single top level config file. if we are operating on
      // a workspace in a repo without a root lockfile, then this parser will
      // run for all configured packages and each one will have its item
      // replaced in the updates array based on the directory.
      // otherwise, we want only a single dependabot updater which will operate
      // on the root lockfile, even for workspaces. this is to prevent dependabot
      // from opening multiple PRs for each instance of a shared dependency
      '.github/dependabot.yml': {
        file: 'files/dependabot.yml',
        filter: (o) => isDependabotMerge(o) ? true : o.pkg.isRoot,
        parser: ({ YmlMerge }, o) => isDependabotMerge(o) && class extends YmlMerge {
          static clean = true
          static key = 'updates'
          static id = 'directory'
        },
      },
    },
    rm: {
      '.github/workflows/pull-request.yml': {
        filter: (o) => o.repo.allPrivate,
      },
    },
  },
  root: {
    files: {
      add: {
        '.commitlintrc.js': 'files/commitlintrc.js',
        '.github/ISSUE_TEMPLATE/bug.yml': 'files/bug.yml',
        '.github/ISSUE_TEMPLATE/config.yml': 'files/config.yml',
        '.github/CODEOWNERS': 'files/CODEOWNERS',
        '.npmrc': 'files/npmrc',
        'SECURITY.md': 'files/SECURITY.md',
        'CODE_OF_CONDUCT.md': 'files/CODE_OF_CONDUCT.md',
      },
      rm: [
        '.github/workflows/release-test.yml',
        '.github/workflows/release-please.yml',
        '.eslintrc.!(js|local.*)',
      ],
    },
  },
  workspace: {
    rootFiles: {
      rm: {
        // These are the old release please and ci files that should be removed now
        '.github/workflows/release-please{$ pkg.nameFs $}.yml': true,
        '.github/workflows/ci{$ pkg.nameFs $}.yml': true,
      },
    },
    files: {
      rm: [
        '.npmrc',
        'SECURITY.md',
      ],
    },
  },
}

module.exports = {
  data: {
    values: data,
    postData,
    workspace: {
      values: {
        // workspaces never get a lockfile regardless of root setting
        lockfile: false,
      },
    },
  },
  rules: {
    '@npmcli/template-oss-rules/lib/rules/files': {
      options: filesOptions,
    },
    '@npmcli/template-oss-rules/lib/rules/unwanted-packages': {
      options: {
        packages: [
          'eslint',
          'eslint-plugin-node',
          '@npmcli/lint',
          'eslint-plugin-promise',
          'eslint-plugin-standard',
          'eslint-plugin-import',
          'standard',
        ],
      },
    },
    '@npmcli/template-oss-rules/lib/rules/required-packages': {
      options: {
        devDependencies: [
          '@npmcli/eslint-config',
          'tap',
        ],
      },
    },
    '@npmcli/template-oss-rules/lib/rules/gitignore': {},
    '@npmcli/template-oss-rules/lib/rules/engines': {
      options: {
        skipPackages: [],
      },
    },
  },
}
