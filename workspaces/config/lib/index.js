const { Parsers } = require('@npmcli/template-oss-rules/lib/rules/files')
const { data, postData } = require('./data.js')

const isPublic = (o) => o.pkg.isPublic

const isDependabotMerge = (o) => o.repo.isMono && !o.rootPkg.data.lockfile

const jsAction = (dir, file) => ({
  [`.github/actions/${dir}/index.js`]: `${file}/lib/index.js`,
  [`.github/actions/${dir}/action.yml`]: `${file}/lib/action.yml`,
})

const filesOptions = {
  parser: {
    matches: {
      // '.github/workflows/*.yml': parsers.WorkflowYml,
      '*release-please-*.json': class ReleasePleaseConfig extends Parsers.JsonMerge {
        clean = true
        comment = null
      },
      '.github/actions/*/index.js': Parsers.Esbuild,
    },
  },
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
      '.release-please-manifest.json': {
        file: 'files/release-please-manifest.json',
        filter: isPublic,
      },
      'release-please-config.json': {
        file: 'files/release-please-config.json',
        filter: isPublic,
      },
      // ci
      '.github/matchers/tap.json': 'files/tap.json',
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
        parser: (o) => isDependabotMerge(o) && class DependabotYml extends parsers.YmlAppend {
          clean = true
          parserOptions = { key: 'updates', id: 'directory' }
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
    files: {
      rm: [
        '.npmrc',
        'SECURITY.md',
      ],
    },
    rootFiles: {
      rm: [
        // These are the old release please and ci files that should be removed now
        '.github/workflows/release-please{$ pkg.nameFs $}.yml',
        '.github/workflows/ci-{$ pkg.nameFs $}.yml',
      ],
    },
  },
}

module.exports = {
  data: {
    values: data,
    postData,
    options: {
      mergeArrays: ['allowPaths', 'distPaths'],
    },
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
