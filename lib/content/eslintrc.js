'use strict'

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => `./${file}`)

module.exports = {
  root: true,
  {{#if isRootMono}}
  ignorePatterns: [
    {{#each workspaces}}
    '{{.}}',
    {{/each}}
  ],
  {{/if}}
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}
