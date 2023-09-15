'use strict'

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => `./${file}`)

module.exports = {
  root: true,
  ignorePatterns: [
    'tap-testdir*/',
    {{#each workspaceGlobs}}
    '{{ . }}',
    {{/each}}
  ],
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}
