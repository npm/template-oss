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

'use strict'

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

.github/matchers/tap.json
========================================
{
  "//@npmcli/template-oss": "This file is automatically added by @npmcli/template-oss. Do not edit.",
  "problemMatcher": [
    {
      "owner": "tap",
      "pattern": [
        {
          "regexp": "^/s*not ok /d+ - (.*)",
          "message": 1
        },
        {
          "regexp": "^/s*---"
        },
        {
          "regexp": "^/s*at:"
        },
        {
          "regexp": "^/s*line:/s*(/d+)",
          "line": 1
        },
        {
          "regexp": "^/s*column:/s*(/d+)",
          "column": 1
        },
        {
          "regexp": "^/s*file:/s*(.*)",
          "file": 1
        }
      ]
    }
  ]
}

.github/workflows/audit.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

on:
  workflow_dispatch:
  schedule:
    # "At 08:00 UTC (01:00 PT) on Monday" https://crontab.guru/#0_8_*_*_1
    - cron: "0 8 * * 1"

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund --package-lock
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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
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
    # "At 10:00 UTC (03:00 PT) on Monday" https://crontab.guru/#0_10_*_*_1
    - cron: "0 10 * * 1"

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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

# https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
permissions:
  contents: write

jobs:
  template-oss-apply:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ github.event.pull_request.head_ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"

      # A new version of template-oss will always have changes
      # so we dont need to check the git status here
      - name: Apply changes
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: apply
        run: |
          npx --offline template-oss-apply --force
          echo "::set-output name=changes::true"

      # If we are updating to a semver major version, then we should treat the result
      # of template-oss-apply as a breaking change
      - name: Set commit prefix
        id: commit
        if: steps.apply.outputs.changes
        run: |
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # the commit should be \`--amend\`-ed manually with stafftools.
          if [[ "\${{ steps.dependabot-metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            echo "::set-output name=prefix::feat!"
          else
            echo "::set-output name=prefix::chore"
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In this case it does fail, we continue
      # and try to apply only a portion of the changes
      - name: Commit and push all changes
        if: steps.apply.outputs.changes
        id: push
        continue-on-error: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit -am "\${{ steps.commit.outputs.prefix }}: postinstall for dependabot template-oss PR"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Commit and push all changes except workflows
        if: steps.apply.outputs.changes && steps.push-all.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.commit.outputs.prefix }}: postinstall for dependabot template-oss PR"
          git push

      # Check if all the necessary template-oss changes were applied. Since we continued
      # on errors in one of the previous steps, this check will fail if our follow up
      # only applied a portion of the changes and we need to followup manually.
      #
      # Note that this used to run \`lint\` and \`postlint\` but that will fail this action
      # if we've also shipped any linting changes separate from template-oss. We do
      # linting in another action, so we want to fail this one only if there are
      # template-oss changes that could not be applied.
      - name: Check for changes
        if: steps.apply.outputs.changes
        run: npx --offline template-oss-check

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Check commits or PR title
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

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        run: npx --offline template-oss-release-please
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  post-pr:
    needs: release-please
    if: needs.release-please.outputs.pr
    runs-on: ubuntu-latest
    outputs:
      ref: \${{ steps.ref.outputs.branch }}
    steps:
      - name: Output ref
        id: ref
        run: echo "::set-output name=branch::\${{ fromJSON(needs.release-please.outputs.pr).headBranchName }}"
      - uses: actions/checkout@v3
        with:
          ref: \${{ steps.ref.outputs.branch }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post pull request actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts --if-present -ws -iwr
          git commit -am "chore: post pull request" || true
          git push

  release-test:
    needs: post-pr
    if: needs.post-pr.outputs.ref
    uses: ./.github/workflows/release-test.yml
    with:
      ref: \${{ needs.post-pr.outputs.ref }}

  post-release:
    needs: release-please
    if: needs.release-please.outputs.release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post release actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-release --ignore-scripts --if-present -ws -iwr

.github/workflows/release-test.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string

jobs:
  lint-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - run: npm run lint --if-present --workspaces --include-workspace-root

  test-all:
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
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - run: npm run test --if-present --workspaces --include-workspace-root

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
!/.release-please-manifest.json
!/CODE_OF_CONDUCT.md
!/SECURITY.md
!/bin/
!/lib/
!/package.json
!/release-please-config.json

.npmrc
========================================
; This file is automatically added by @npmcli/template-oss. Do not edit.

package-lock=false

.release-please-manifest.json
========================================
{
  ".": "1.0.0"
}

CODE_OF_CONDUCT.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

All interactions in this repo are covered by the [npm Code of
Conduct](https://docs.npmjs.com/policies/conduct)

The npm cli team may, at its own discretion, moderate, remove, or edit
any interactions such as pull requests, issues, and comments.

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
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

release-please-config.json
========================================
{
  "exclude-packages-from-root": true,
  "group-pull-request-title-pattern": "chore: release \${version}",
  "pull-request-title-pattern": "chore: release\${component} \${version}",
  "changelog-sections": [
    {
      "type": "feat",
      "section": "Features",
      "hidden": false
    },
    {
      "type": "fix",
      "section": "Bug Fixes",
      "hidden": false
    },
    {
      "type": "docs",
      "section": "Documentation",
      "hidden": false
    },
    {
      "type": "deps",
      "section": "Dependencies",
      "hidden": false
    },
    {
      "type": "chore",
      "hidden": true
    }
  ],
  "packages": {
    ".": {
      "package-name": ""
    }
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

'use strict'

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

.github/matchers/tap.json
========================================
{
  "//@npmcli/template-oss": "This file is automatically added by @npmcli/template-oss. Do not edit.",
  "problemMatcher": [
    {
      "owner": "tap",
      "pattern": [
        {
          "regexp": "^/s*not ok /d+ - (.*)",
          "message": 1
        },
        {
          "regexp": "^/s*---"
        },
        {
          "regexp": "^/s*at:"
        },
        {
          "regexp": "^/s*line:/s*(/d+)",
          "line": 1
        },
        {
          "regexp": "^/s*column:/s*(/d+)",
          "column": 1
        },
        {
          "regexp": "^/s*file:/s*(.*)",
          "file": 1
        }
      ]
    }
  ]
}

.github/workflows/audit.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

on:
  workflow_dispatch:
  schedule:
    # "At 08:00 UTC (01:00 PT) on Monday" https://crontab.guru/#0_8_*_*_1
    - cron: "0 8 * * 1"

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund --package-lock
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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
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
    # "At 10:00 UTC (03:00 PT) on Monday" https://crontab.guru/#0_10_*_*_1
    - cron: "0 10 * * 1"

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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

# https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
permissions:
  contents: write

jobs:
  template-oss-apply:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ github.event.pull_request.head_ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"

      # A new version of template-oss will always have changes
      # so we dont need to check the git status here
      - name: Apply changes
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: apply
        run: |
          npx --offline template-oss-apply --force
          echo "::set-output name=changes::true"

      # If we are updating to a semver major version, then we should treat the result
      # of template-oss-apply as a breaking change
      - name: Set commit prefix
        id: commit
        if: steps.apply.outputs.changes
        run: |
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # the commit should be \`--amend\`-ed manually with stafftools.
          if [[ "\${{ steps.dependabot-metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            echo "::set-output name=prefix::feat!"
          else
            echo "::set-output name=prefix::chore"
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In this case it does fail, we continue
      # and try to apply only a portion of the changes
      - name: Commit and push all changes
        if: steps.apply.outputs.changes
        id: push
        continue-on-error: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit -am "\${{ steps.commit.outputs.prefix }}: postinstall for dependabot template-oss PR"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Commit and push all changes except workflows
        if: steps.apply.outputs.changes && steps.push-all.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.commit.outputs.prefix }}: postinstall for dependabot template-oss PR"
          git push

      # Check if all the necessary template-oss changes were applied. Since we continued
      # on errors in one of the previous steps, this check will fail if our follow up
      # only applied a portion of the changes and we need to followup manually.
      #
      # Note that this used to run \`lint\` and \`postlint\` but that will fail this action
      # if we've also shipped any linting changes separate from template-oss. We do
      # linting in another action, so we want to fail this one only if there are
      # template-oss changes that could not be applied.
      - name: Check for changes
        if: steps.apply.outputs.changes
        run: npx --offline template-oss-check

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Check commits or PR title
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

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        run: npx --offline template-oss-release-please
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  post-pr:
    needs: release-please
    if: needs.release-please.outputs.pr
    runs-on: ubuntu-latest
    outputs:
      ref: \${{ steps.ref.outputs.branch }}
    steps:
      - name: Output ref
        id: ref
        run: echo "::set-output name=branch::\${{ fromJSON(needs.release-please.outputs.pr).headBranchName }}"
      - uses: actions/checkout@v3
        with:
          ref: \${{ steps.ref.outputs.branch }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post pull request actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts --if-present -ws -iwr
          git commit -am "chore: post pull request" || true
          git push

  release-test:
    needs: post-pr
    if: needs.post-pr.outputs.ref
    uses: ./.github/workflows/release-test.yml
    with:
      ref: \${{ needs.post-pr.outputs.ref }}

  post-release:
    needs: release-please
    if: needs.release-please.outputs.release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post release actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-release --ignore-scripts --if-present -ws -iwr

.github/workflows/release-test.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string

jobs:
  lint-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - run: npm run lint --if-present --workspaces --include-workspace-root

  test-all:
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
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - run: npm run test --if-present --workspaces --include-workspace-root

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
!/.release-please-manifest.json
!/CODE_OF_CONDUCT.md
!/SECURITY.md
!/bin/
!/lib/
!/package.json
!/release-please-config.json
!/workspaces/

.npmrc
========================================
; This file is automatically added by @npmcli/template-oss. Do not edit.

package-lock=false

.release-please-manifest.json
========================================
{
  ".": "1.0.0",
  "workspaces/a": "1.0.0",
  "workspaces/b": "1.0.0"
}

CODE_OF_CONDUCT.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

All interactions in this repo are covered by the [npm Code of
Conduct](https://docs.npmjs.com/policies/conduct)

The npm cli team may, at its own discretion, moderate, remove, or edit
any interactions such as pull requests, issues, and comments.

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
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

release-please-config.json
========================================
{
  "plugins": [
    "node-workspace",
    "workspace-deps"
  ],
  "exclude-packages-from-root": true,
  "group-pull-request-title-pattern": "chore: release \${version}",
  "pull-request-title-pattern": "chore: release\${component} \${version}",
  "changelog-sections": [
    {
      "type": "feat",
      "section": "Features",
      "hidden": false
    },
    {
      "type": "fix",
      "section": "Bug Fixes",
      "hidden": false
    },
    {
      "type": "docs",
      "section": "Documentation",
      "hidden": false
    },
    {
      "type": "deps",
      "section": "Dependencies",
      "hidden": false
    },
    {
      "type": "chore",
      "hidden": true
    }
  ],
  "packages": {
    ".": {
      "package-name": ""
    },
    "workspaces/a": {},
    "workspaces/b": {}
  }
}

workspaces/a/.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

'use strict'

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
  "version": "1.0.0",
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

'use strict'

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
  "version": "1.0.0",
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

exports[`test/apply/full-content.js TAP workspaces only > expect resolving Promise 1`] = `
.github/matchers/tap.json
========================================
{
  "//@npmcli/template-oss": "This file is automatically added by @npmcli/template-oss. Do not edit.",
  "problemMatcher": [
    {
      "owner": "tap",
      "pattern": [
        {
          "regexp": "^/s*not ok /d+ - (.*)",
          "message": 1
        },
        {
          "regexp": "^/s*---"
        },
        {
          "regexp": "^/s*at:"
        },
        {
          "regexp": "^/s*line:/s*(/d+)",
          "line": 1
        },
        {
          "regexp": "^/s*column:/s*(/d+)",
          "column": 1
        },
        {
          "regexp": "^/s*file:/s*(.*)",
          "file": 1
        }
      ]
    }
  ]
}

.github/workflows/ci-a.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - a

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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - run: npm run lint -w a

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - run: npm test --ignore-scripts -w a

.github/workflows/ci-b.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - b

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
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - run: npm run lint -w b

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
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - run: npm test --ignore-scripts -w b

.github/workflows/release-please.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Please

on:
  push:
    branches:
      - main
      - latest

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        run: npx --offline template-oss-release-please
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  post-pr:
    needs: release-please
    if: needs.release-please.outputs.pr
    runs-on: ubuntu-latest
    outputs:
      ref: \${{ steps.ref.outputs.branch }}
    steps:
      - name: Output ref
        id: ref
        run: echo "::set-output name=branch::\${{ fromJSON(needs.release-please.outputs.pr).headBranchName }}"
      - uses: actions/checkout@v3
        with:
          ref: \${{ steps.ref.outputs.branch }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post pull request actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts --if-present -ws -iwr
          git commit -am "chore: post pull request" || true
          git push

  release-test:
    needs: post-pr
    if: needs.post-pr.outputs.ref
    uses: ./.github/workflows/release-test.yml
    with:
      ref: \${{ needs.post-pr.outputs.ref }}

  post-release:
    needs: release-please
    if: needs.release-please.outputs.release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: Post release actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-release --ignore-scripts --if-present -ws -iwr

.github/workflows/release-test.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string

jobs:
  lint-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - name: Update npm to latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - run: npm -v
      - run: npm i --ignore-scripts --no-audit --no-fund
      - run: npm run lint --if-present --workspaces --include-workspace-root

  test-all:
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
        with:
          ref: \${{ inputs.ref }}
      - name: Setup git user
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
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
      - run: npm i --ignore-scripts --no-audit --no-fund
      - name: add tap problem matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - run: npm run test --if-present --workspaces --include-workspace-root

.release-please-manifest.json
========================================
{
  "workspaces/a": "1.0.0",
  "workspaces/b": "1.0.0"
}

package.json
========================================
{
  "templateOSS": {
    "rootRepo": false,
    "rootModule": false,
    "version": "{{VERSION}}"
  },
  "name": "testpkg",
  "version": "1.0.0",
  "workspaces": [
    "workspaces/a",
    "workspaces/b"
  ]
}

release-please-config.json
========================================
{
  "plugins": [
    "node-workspace",
    "workspace-deps"
  ],
  "exclude-packages-from-root": true,
  "group-pull-request-title-pattern": "chore: release \${version}",
  "pull-request-title-pattern": "chore: release\${component} \${version}",
  "changelog-sections": [
    {
      "type": "feat",
      "section": "Features",
      "hidden": false
    },
    {
      "type": "fix",
      "section": "Bug Fixes",
      "hidden": false
    },
    {
      "type": "docs",
      "section": "Documentation",
      "hidden": false
    },
    {
      "type": "deps",
      "section": "Dependencies",
      "hidden": false
    },
    {
      "type": "chore",
      "hidden": true
    }
  ],
  "packages": {
    "workspaces/a": {},
    "workspaces/b": {}
  }
}

workspaces/a/.eslintrc.js
========================================
/* This file is automatically added by @npmcli/template-oss. Do not edit. */

'use strict'

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
  "name": "a",
  "version": "1.0.0",
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

'use strict'

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
  "name": "b",
  "version": "1.0.0",
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
