/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/apply/full-content.js TAP default > expect resolving Promise 1`] = `
.commitlintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'deps', 'chore']],
    'header-max-length': [2, 'always', 80],
    'subject-case': [0, 'always', ['lower-case', 'sentence-case', 'start-case']],
  },
}

.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => \`./\${file}\`)

module.exports = {
  root: true,
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

.github/CODEOWNERS
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

* @npm/cli-team

.github/ISSUE_TEMPLATE/bug.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Bug
description: File a bug/issue
title: "[BUG] <title>"
labels: [ Bug, Needs Triage ]

body:
  - type: checkboxes
    attributes:
      label: Is there an existing issue for this?
      description: Please [search here](./issues) to see if an issue already exists for your problem.
      options:
        - label: I have searched the existing issues
          required: true
  - type: textarea
    attributes:
      label: Current Behavior
      description: A clear & concise description of what you're experiencing.
    validations:
      required: false
  - type: textarea
    attributes:
      label: Expected Behavior
      description: A clear & concise description of what you expected to happen.
    validations:
      required: false
  - type: textarea
    attributes:
      label: Steps To Reproduce
      description: Steps to reproduce the behavior.
      value: |
        1. In this environment...
        2. With this config...
        3. Run '...'
        4. See error...
    validations:
      required: false
  - type: textarea
    attributes:
      label: Environment
      description: |
        examples:
          - **npm**: 7.6.3
          - **Node**: 13.14.0
          - **OS**: Ubuntu 20.04
          - **platform**: Macbook Pro
      value: |
        - npm:
        - Node:
        - OS:
        - platform:
    validations:
      required: false

.github/ISSUE_TEMPLATE/config.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

blank_issues_enabled: true

.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: daily
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"

.github/workflows/audit.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

on:
  workflow_dispatch:
  schedule:
    # "At 01:00 on Monday" https://crontab.guru/#0_1_*_*_1
    - cron: "0 1 * * 1"

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --package-lock
      - run: npm audit

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
  pull_request:
    branches:
      - '*'
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 02:00 on Monday" https://crontab.guru/#0_2_*_*_1
    - cron: "0 2 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm run lint

  test:
    strategy:
      fail-fast: false
      matrix:
        node-version:
          - 12.13.0
          - 12.x
          - 14.15.0
          - 14.x
          - 16.0.0
          - 16.x
        platform:
          - os: ubuntu-latest
            shell: bash
          - os: macos-latest
            shell: bash
          - os: windows-latest
            shell: cmd
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update to workable npm (windows)
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Update npm to 7
        # If we do test on npm 10 it needs npm7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Update npm to latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm test --ignore-scripts

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: "CodeQL"

on:
  push:
    branches:
      - main
      - latest
  pull_request:
    # The branches below must be a subset of the branches above
    branches:
      - main
      - latest
  schedule:
    # "At 03:00 on Monday" https://crontab.guru/#0_3_*_*_1
    - cron: "0 3 * * 1"

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ javascript ]

    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v1
        with:
          languages: \${{ matrix.language }}
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v1

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot Actions

on: pull_request

# https://docs.github.com/en/rest/overview/permissions-required-for-github-apps
permissions:
  actions: write
  contents: write

jobs:
  Install:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1.1.1
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"
      - name: npm install and commit
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr checkout \${{ github.event.pull_request.number }}
          npm install --ignore-scripts
          npm run template-oss-apply
          git add .
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push
          npm run lint

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request Linting

on:
  pull_request:
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  check:
    name: Check PR Title or Commits
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - name: Install deps
        run: npm i -D @commitlint/cli @commitlint/config-conventional
      - name: Check commits OR PR title
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          npx --offline commitlint -V --from origin/main --to \${{ github.event.pull_request.head.sha }} /
            || echo $PR_TITLE | npx --offline commitlint -V

.github/workflows/release-please.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Please

on:
  push:
    branches:
      - main
      - latest

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v2
        id: release
        with:
          release-type: node
          changelog-types: >
            [
              {"type":"feat","section":"Features","hidden":false},
              {"type":"fix","section":"Bug Fixes","hidden":false},
              {"type":"docs","section":"Documentation","hidden":false},
              {"type":"deps","section":"Dependencies","hidden":false},
              {"type":"chore","hidden":true}
            ]

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!/.eslintrc.local.*
!**/.gitignore
!/docs/
!/tap-snapshots/
!/test/
!/map.js
!/scripts/
!/README*
!/LICENSE*
!/CHANGELOG*
!/.commitlintrc.js
!/.eslintrc.js
!/.github/
!/.gitignore
!/.npmrc
!/SECURITY.md
!/bin/
!/lib/
!/package.json

.npmrc
========================================
; This file is automatically added by @npmcli/template-oss. Do not edit.

package-lock=false

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).

package.json
========================================
{
  "name": "testpkg",
  "scripts": {
    "lint": "eslint /"**/*.js/"",
    "postlint": "template-oss-check",
    "template-oss-apply": "template-oss-apply --force",
    "lintfix": "npm run lint -- --fix",
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  },
  "author": "GitHub Inc.",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }
}
`

exports[`test/apply/full-content.js TAP workspaces + everything > expect resolving Promise 1`] = `
.commitlintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'deps', 'chore']],
    'header-max-length': [2, 'always', 80],
    'subject-case': [0, 'always', ['lower-case', 'sentence-case', 'start-case']],
  },
}

.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => \`./\${file}\`)

module.exports = {
  root: true,
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

.eslintrc.local.yml
========================================
KEEP

.github/CODEOWNERS
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

* @npm/cli-team

.github/ISSUE_TEMPLATE/bug.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Bug
description: File a bug/issue
title: "[BUG] <title>"
labels: [ Bug, Needs Triage ]

body:
  - type: checkboxes
    attributes:
      label: Is there an existing issue for this?
      description: Please [search here](./issues) to see if an issue already exists for your problem.
      options:
        - label: I have searched the existing issues
          required: true
  - type: textarea
    attributes:
      label: Current Behavior
      description: A clear & concise description of what you're experiencing.
    validations:
      required: false
  - type: textarea
    attributes:
      label: Expected Behavior
      description: A clear & concise description of what you expected to happen.
    validations:
      required: false
  - type: textarea
    attributes:
      label: Steps To Reproduce
      description: Steps to reproduce the behavior.
      value: |
        1. In this environment...
        2. With this config...
        3. Run '...'
        4. See error...
    validations:
      required: false
  - type: textarea
    attributes:
      label: Environment
      description: |
        examples:
          - **npm**: 7.6.3
          - **Node**: 13.14.0
          - **OS**: Ubuntu 20.04
          - **platform**: Macbook Pro
      value: |
        - npm:
        - Node:
        - OS:
        - platform:
    validations:
      required: false

.github/ISSUE_TEMPLATE/config.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

blank_issues_enabled: true

.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: daily
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"

.github/workflows/audit.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

on:
  workflow_dispatch:
  schedule:
    # "At 01:00 on Monday" https://crontab.guru/#0_1_*_*_1
    - cron: "0 1 * * 1"

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --package-lock
      - run: npm audit

.github/workflows/ci-bbb.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - bbb

on:
  workflow_dispatch:
  pull_request:
    branches:
      - '*'
    paths:
      - workspaces/b/**
  push:
    branches:
      - main
      - latest
    paths:
      - workspaces/b/**
  schedule:
    # "At 02:00 on Monday" https://crontab.guru/#0_2_*_*_1
    - cron: "0 2 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm run lint -w bbb

  test:
    strategy:
      fail-fast: false
      matrix:
        node-version:
          - 12.13.0
          - 12.x
          - 14.15.0
          - 14.x
          - 16.0.0
          - 16.x
        platform:
          - os: ubuntu-latest
            shell: bash
          - os: macos-latest
            shell: bash
          - os: windows-latest
            shell: cmd
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update to workable npm (windows)
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Update npm to 7
        # If we do test on npm 10 it needs npm7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Update npm to latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm test --ignore-scripts -w bbb

.github/workflows/ci-name-aaaa.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - @name/aaaa

on:
  workflow_dispatch:
  pull_request:
    branches:
      - '*'
    paths:
      - workspaces/a/**
  push:
    branches:
      - main
      - latest
    paths:
      - workspaces/a/**
  schedule:
    # "At 02:00 on Monday" https://crontab.guru/#0_2_*_*_1
    - cron: "0 2 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm run lint -w @name/aaaa

  test:
    strategy:
      fail-fast: false
      matrix:
        node-version:
          - 12.13.0
          - 12.x
          - 14.15.0
          - 14.x
          - 16.0.0
          - 16.x
        platform:
          - os: ubuntu-latest
            shell: bash
          - os: macos-latest
            shell: bash
          - os: windows-latest
            shell: cmd
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update to workable npm (windows)
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Update npm to 7
        # If we do test on npm 10 it needs npm7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Update npm to latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm test --ignore-scripts -w @name/aaaa

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
  pull_request:
    branches:
      - '*'
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 02:00 on Monday" https://crontab.guru/#0_2_*_*_1
    - cron: "0 2 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm run lint

  test:
    strategy:
      fail-fast: false
      matrix:
        node-version:
          - 12.13.0
          - 12.x
          - 14.15.0
          - 14.x
          - 16.0.0
          - 16.x
        platform:
          - os: ubuntu-latest
            shell: bash
          - os: macos-latest
            shell: bash
          - os: windows-latest
            shell: cmd
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update to workable npm (windows)
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Update npm to 7
        # If we do test on npm 10 it needs npm7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Update npm to latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts
      - run: npm test --ignore-scripts

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: "CodeQL"

on:
  push:
    branches:
      - main
      - latest
  pull_request:
    # The branches below must be a subset of the branches above
    branches:
      - main
      - latest
  schedule:
    # "At 03:00 on Monday" https://crontab.guru/#0_3_*_*_1
    - cron: "0 3 * * 1"

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ javascript ]

    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v1
        with:
          languages: \${{ matrix.language }}
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v1

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot Actions

on: pull_request

# https://docs.github.com/en/rest/overview/permissions-required-for-github-apps
permissions:
  actions: write
  contents: write

jobs:
  Install:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1.1.1
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"
      - name: npm install and commit
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr checkout \${{ github.event.pull_request.number }}
          npm install --ignore-scripts
          npm run template-oss-apply
          git add .
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push
          npm run lint

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request Linting

on:
  pull_request:
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  check:
    name: Check PR Title or Commits
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup git user
        run: |
          git config --global user.email "ops+npm-cli@npmjs.com"
          git config --global user.name "npm cli ops bot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - name: Install deps
        run: npm i -D @commitlint/cli @commitlint/config-conventional
      - name: Check commits OR PR title
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          npx --offline commitlint -V --from origin/main --to \${{ github.event.pull_request.head.sha }} /
            || echo $PR_TITLE | npx --offline commitlint -V

.github/workflows/release-please-bbb.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Please - bbb

on:
  push:
    paths:
      - workspaces/b/**
    branches:
      - main
      - latest

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v2
        id: release
        with:
          release-type: node
          monorepo-tags: true
          path: workspaces/b
          changelog-types: >
            [
              {"type":"feat","section":"Features","hidden":false},
              {"type":"fix","section":"Bug Fixes","hidden":false},
              {"type":"docs","section":"Documentation","hidden":false},
              {"type":"deps","section":"Dependencies","hidden":false},
              {"type":"chore","hidden":true}
            ]

.github/workflows/release-please-name-aaaa.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Please - @name/aaaa

on:
  push:
    paths:
      - workspaces/a/**
    branches:
      - main
      - latest

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v2
        id: release
        with:
          release-type: node
          monorepo-tags: true
          path: workspaces/a
          changelog-types: >
            [
              {"type":"feat","section":"Features","hidden":false},
              {"type":"fix","section":"Bug Fixes","hidden":false},
              {"type":"docs","section":"Documentation","hidden":false},
              {"type":"deps","section":"Dependencies","hidden":false},
              {"type":"chore","hidden":true}
            ]

.github/workflows/release-please.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Please

on:
  push:
    branches:
      - main
      - latest

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v2
        id: release
        with:
          release-type: node
          changelog-types: >
            [
              {"type":"feat","section":"Features","hidden":false},
              {"type":"fix","section":"Bug Fixes","hidden":false},
              {"type":"docs","section":"Documentation","hidden":false},
              {"type":"deps","section":"Dependencies","hidden":false},
              {"type":"chore","hidden":true}
            ]

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!/.eslintrc.local.*
!**/.gitignore
!/docs/
!/tap-snapshots/
!/test/
!/map.js
!/scripts/
!/README*
!/LICENSE*
!/CHANGELOG*
!/.commitlintrc.js
!/.eslintrc.js
!/.github/
!/.gitignore
!/.npmrc
!/SECURITY.md
!/bin/
!/lib/
!/package.json
!/workspaces/

.npmrc
========================================
; This file is automatically added by @npmcli/template-oss. Do not edit.

package-lock=false

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).

package.json
========================================
{
  "name": "testpkg",
  "workspaces": [
    "workspaces/a",
    "workspaces/b"
  ],
  "scripts": {
    "lint": "eslint /"**/*.js/"",
    "postlint": "template-oss-check",
    "template-oss-apply": "template-oss-apply --force",
    "lintfix": "npm run lint -- --fix",
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  },
  "author": "GitHub Inc.",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }
}

workspaces/a/.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => \`./\${file}\`)

module.exports = {
  root: true,
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

workspaces/a/.eslintrc.local.yml
========================================
KEEP

workspaces/a/.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!/.eslintrc.local.*
!**/.gitignore
!/docs/
!/tap-snapshots/
!/test/
!/map.js
!/scripts/
!/README*
!/LICENSE*
!/CHANGELOG*
!/.eslintrc.js
!/.gitignore
!/bin/
!/lib/
!/package.json

workspaces/a/package.json
========================================
{
  "name": "@name/aaaa",
  "scripts": {
    "lint": "eslint /"**/*.js/"",
    "postlint": "template-oss-check",
    "template-oss-apply": "template-oss-apply --force",
    "lintfix": "npm run lint -- --fix",
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  },
  "author": "GitHub Inc.",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }
}

workspaces/b/.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

const { readdirSync: readdir } = require('fs')

const localConfigs = readdir(__dirname)
  .filter((file) => file.startsWith('.eslintrc.local.'))
  .map((file) => \`./\${file}\`)

module.exports = {
  root: true,
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

workspaces/b/.eslintrc.local.yml
========================================
KEEP

workspaces/b/.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!/.eslintrc.local.*
!**/.gitignore
!/docs/
!/tap-snapshots/
!/test/
!/map.js
!/scripts/
!/README*
!/LICENSE*
!/CHANGELOG*
!/.eslintrc.js
!/.gitignore
!/bin/
!/lib/
!/package.json

workspaces/b/package.json
========================================
{
  "name": "bbb",
  "scripts": {
    "lint": "eslint /"**/*.js/"",
    "postlint": "template-oss-check",
    "template-oss-apply": "template-oss-apply --force",
    "lintfix": "npm run lint -- --fix",
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  },
  "author": "GitHub Inc.",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }
}
`
