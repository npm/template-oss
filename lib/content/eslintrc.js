'use strict'

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => `./${file}`)

module.exports = {
  root: true,
  {{#if workspaceGlobs}}
  ignorePatterns: [
    {{#each workspaceGlobs}}
    '{{ . }}',
    {{/each}}
  ],
  {{/if}}
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: false }],
  },
  overrides: [
    {
      files: ['**/test/**', '.eslintrc.js', '.eslintrc.local.js'],
      rules: {
        // back to default options
        'import/no-extraneous-dependencies': ['error', {}],
      },
    },
  ],
}
