'use strict'

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => `./${file}`)

module.exports = {
  root: true,
  {#- if pkg.workspaceGlobs.length #}
  ignorePatterns: [
    {# for g in pkg.workspaceGlobs -#}
    '{$ g $}',
    {#- endfor #}
  ],
  {#- endif #}
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}
