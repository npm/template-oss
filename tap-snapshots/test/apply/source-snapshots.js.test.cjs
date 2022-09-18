/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/apply/source-snapshots.js TAP root only > expect resolving Promise 1`] = `
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

.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: /
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
    name: Audit Dependencies
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund --package-lock
      - name: Run Audit
        run: npm audit

.github/workflows/ci-release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string
      check-sha:
        required: true
        type: string

jobs:
  lint-all:
    name: Lint All
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
  pull_request:
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -iwr

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  push:
    branches:
      - main
      - latest
  pull_request:
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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on: pull_request

permissions:
  contents: write

jobs:
  template-oss:
    name: template-oss
    if: github.repository_owner == 'npm' && github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ github.event.pull_request.head_ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # Dependabot can update multiple directories so we output which directory
      # it is acting on so we can run the command for the correct root or workspace
      - name: Get Dependabot Directory
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: flags
        run: |
          if [[ "\${{ steps.metadata.outputs.directory }}" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            echo "::set-output name=workspace::-w \${{ steps.metadata.outputs.directory }}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.changes
        id: push
        continue-on-error: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Push All Changes Except Workflows
        if: steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request

on:
  pull_request:
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  commitlint:
    name: Lint Commits
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: |
          npx --offline commitlint -V --from origin/\${{ github.base_ref }} --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        run: |
          echo \${{ github.event.pull_request.title }} | npx --offline commitlint -V

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      releases: \${{ steps.release.outputs.releases }}
      release-flags: \${{ steps.release.outputs.release-flags }}
      branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.result }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please \${{ github.ref_name }}
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
        with:
          script: |
            const repo = { owner: context.repo.owner, repo: context.repo.repo }
            const issue = { ...repo, issue_number: process.env.PR_NUMBER }

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ ...repo, run_id: context.runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, issue)
            let commentId = comments?.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`- Release workflow run: \${workflow.html_url}\`
            if (commentId) {
              await github.rest.issues.updateComment({ ...repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ ...issue, body })
              commentId = comment?.id
            }

            return commentId
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-number
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Pull Request Actions
        env:
          RELEASE_PR_NUMBER: \${{ needs.release.outputs.pr-number }}
          RELEASE_COMMENT_ID: \${{ needs.release.outputs.comment-id }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts -ws -iwr --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ needs.release.outputs.check-id }}

  ci:
    name: CI - Release
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci-release.yml
    with:
      ref: \${{ needs.release.outputs.branch }}
      check-sha: \${{ needs.update.outputs.sha }}

  post-ci:
    needs: [ release, update, ci ]
    name: Post CI - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Needs Result
        id: needs-result
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "::set-output name=result::$result"
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Release Actions
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        run: |
          npm run rp-release --ignore-scripts --if-present \${{ join(needs.release.outputs.release-flags, ' ') }}

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!**/.gitignore
!/.commitlintrc.js
!/.eslintrc.js
!/.eslintrc.local.*
!/.github/
!/.gitignore
!/.npmrc
!/.release-please-manifest.json
!/bin/
!/CHANGELOG*
!/CODE_OF_CONDUCT.md
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/release-please-config.json
!/scripts/
!/SECURITY.md
!/tap-snapshots/
!/test/

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
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).
`

exports[`test/apply/source-snapshots.js TAP with content path > expect resolving Promise 1`] = `
content_dir/index.js
========================================
module.exports={}

package.json
========================================
{
  "templateOSS": {
    "content": "content_dir",
    "defaultContent": false,
    "version": "{{VERSION}}"
  },
  "name": "testpkg",
  "version": "1.0.0"
}
`

exports[`test/apply/source-snapshots.js TAP with workspaces > expect resolving Promise 1`] = `
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
  ignorePatterns: [
    'workspaces/a/**',
    'workspaces/b/**',
  ],
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

.github/CODEOWNERS
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

* @npm/cli-team

.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: /
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
  - package-ecosystem: npm
    directory: workspaces/a/
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
  - package-ecosystem: npm
    directory: workspaces/b/
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
    name: Audit Dependencies
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund --package-lock
      - name: Run Audit
        run: npm audit

.github/workflows/ci-a.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - a

on:
  workflow_dispatch:
  pull_request:
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
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -w a

.github/workflows/ci-b.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - b

on:
  workflow_dispatch:
  pull_request:
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
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -w b

.github/workflows/ci-release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string
      check-sha:
        required: true
        type: string

jobs:
  lint-all:
    name: Lint All
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
  pull_request:
    paths-ignore:
  push:
    branches:
      - main
      - latest
    paths-ignore:
  schedule:
    # "At 09:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  lint:
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -iwr

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  push:
    branches:
      - main
      - latest
  pull_request:
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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on: pull_request

permissions:
  contents: write

jobs:
  template-oss:
    name: template-oss
    if: github.repository_owner == 'npm' && github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ github.event.pull_request.head_ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # Dependabot can update multiple directories so we output which directory
      # it is acting on so we can run the command for the correct root or workspace
      - name: Get Dependabot Directory
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: flags
        run: |
          if [[ "\${{ steps.metadata.outputs.directory }}" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            echo "::set-output name=workspace::-w \${{ steps.metadata.outputs.directory }}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.changes
        id: push
        continue-on-error: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Push All Changes Except Workflows
        if: steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request

on:
  pull_request:
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  commitlint:
    name: Lint Commits
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: |
          npx --offline commitlint -V --from origin/\${{ github.base_ref }} --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        run: |
          echo \${{ github.event.pull_request.title }} | npx --offline commitlint -V

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      releases: \${{ steps.release.outputs.releases }}
      release-flags: \${{ steps.release.outputs.release-flags }}
      branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.result }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please \${{ github.ref_name }}
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
        with:
          script: |
            const repo = { owner: context.repo.owner, repo: context.repo.repo }
            const issue = { ...repo, issue_number: process.env.PR_NUMBER }

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ ...repo, run_id: context.runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, issue)
            let commentId = comments?.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`- Release workflow run: \${workflow.html_url}\`
            if (commentId) {
              await github.rest.issues.updateComment({ ...repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ ...issue, body })
              commentId = comment?.id
            }

            return commentId
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-number
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Pull Request Actions
        env:
          RELEASE_PR_NUMBER: \${{ needs.release.outputs.pr-number }}
          RELEASE_COMMENT_ID: \${{ needs.release.outputs.comment-id }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts -ws -iwr --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ needs.release.outputs.check-id }}

  ci:
    name: CI - Release
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci-release.yml
    with:
      ref: \${{ needs.release.outputs.branch }}
      check-sha: \${{ needs.update.outputs.sha }}

  post-ci:
    needs: [ release, update, ci ]
    name: Post CI - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Needs Result
        id: needs-result
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "::set-output name=result::$result"
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Release Actions
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        run: |
          npm run rp-release --ignore-scripts --if-present \${{ join(needs.release.outputs.release-flags, ' ') }}

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*

# keep these
!**/.gitignore
!/.commitlintrc.js
!/.eslintrc.js
!/.eslintrc.local.*
!/.github/
!/.gitignore
!/.npmrc
!/.release-please-manifest.json
!/bin/
!/CHANGELOG*
!/CODE_OF_CONDUCT.md
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/release-please-config.json
!/scripts/
!/SECURITY.md
!/tap-snapshots/
!/test/
!/workspaces/
/workspaces/*
!/workspaces/a/
!/workspaces/b/

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
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint",
    "test-all": "npm run test -ws -iwr --if-present",
    "lint-all": "npm run lint -ws -iwr --if-present"
  },
  "author": "GitHub Inc.",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "test-ignore": "^(workspaces/a|workspaces/b)/**",
    "nyc-arg": [
      "--exclude",
      "workspaces/a/**",
      "--exclude",
      "workspaces/b/**",
      "--exclude",
      "tap-snapshots/**"
    ]
  }
}

release-please-config.json
========================================
{
  "plugins": [
    "node-workspace"
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

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

Please send vulnerability reports through [hackerone](https://hackerone.com/github).

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
!**/.gitignore
!/.eslintrc.js
!/.eslintrc.local.*
!/.gitignore
!/bin/
!/CHANGELOG*
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/scripts/
!/tap-snapshots/
!/test/

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
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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
!**/.gitignore
!/.eslintrc.js
!/.eslintrc.local.*
!/.gitignore
!/bin/
!/CHANGELOG*
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/scripts/
!/tap-snapshots/
!/test/

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
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
  }
}
`

exports[`test/apply/source-snapshots.js TAP workspaces only > expect resolving Promise 1`] = `
.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: workspaces/a/
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
  - package-ecosystem: npm
    directory: workspaces/b/
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

.github/workflows/ci-a.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - a

on:
  workflow_dispatch:
  pull_request:
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
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -w a

.github/workflows/ci-b.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - b

on:
  workflow_dispatch:
  pull_request:
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
    name: Lint
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -w b

.github/workflows/ci-release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - Release

on:
  workflow_call:
    inputs:
      ref:
        required: true
        type: string
      check-sha:
        required: true
        type: string

jobs:
  lint-all:
    name: Lint All
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
    if: github.repository_owner == 'npm'
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Linux
            os: ubuntu-latest
            shell: bash
          - name: macOS
            os: macos-latest
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 14.17.0
          - 14.x
          - 16.13.0
          - 16.x
          - 18.0.0
          - 18.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - Node \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Update Windows npm
        # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
        run: |
          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
          tar xf npm-7.5.4.tgz
          cd package
          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
          cd ..
          rmdir /s /q package
      - name: Install npm@7
        if: startsWith(matrix.node-version, '10.')
        run: npm i --prefer-online --no-fund --no-audit -g npm@7
      - name: Install npm@latest
        if: \${{ !startsWith(matrix.node-version, '10.') }}
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on: pull_request

permissions:
  contents: write

jobs:
  template-oss:
    name: template-oss
    if: github.repository_owner == 'npm' && github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ github.event.pull_request.head_ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # Dependabot can update multiple directories so we output which directory
      # it is acting on so we can run the command for the correct root or workspace
      - name: Get Dependabot Directory
        if: contains(steps.metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: flags
        run: |
          if [[ "\${{ steps.metadata.outputs.directory }}" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            echo "::set-output name=workspace::-w \${{ steps.metadata.outputs.directory }}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.changes
        id: push
        continue-on-error: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Push All Changes Except Workflows
        if: steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "chore: postinstall for dependabot template-oss PR"
          git push

      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      releases: \${{ steps.release.outputs.releases }}
      release-flags: \${{ steps.release.outputs.release-flags }}
      branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.result }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please \${{ github.ref_name }}
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
        with:
          script: |
            const repo = { owner: context.repo.owner, repo: context.repo.repo }
            const issue = { ...repo, issue_number: process.env.PR_NUMBER }

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ ...repo, run_id: context.runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, issue)
            let commentId = comments?.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`- Release workflow run: \${workflow.html_url}\`
            if (commentId) {
              await github.rest.issues.updateComment({ ...repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ ...issue, body })
              commentId = comment?.id
            }

            return commentId
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-number
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check_id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Pull Request Actions
        env:
          RELEASE_PR_NUMBER: \${{ needs.release.outputs.pr-number }}
          RELEASE_COMMENT_ID: \${{ needs.release.outputs.comment-id }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run rp-pull-request --ignore-scripts -ws -iwr --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check

        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          # XXX: this does not work when using the default GITHUB_TOKEN.
          # Instead we post the main job url to the PR as a comment which
          # will link to all the other checks. To work around this we would
          # need to create a GitHub that would create on-demand tokens.
          # https://github.com/LouisBrunner/checks-action/issues/18
          # details_url:
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ needs.release.outputs.check-id }}

  ci:
    name: CI - Release
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci-release.yml
    with:
      ref: \${{ needs.release.outputs.branch }}
      check-sha: \${{ needs.update.outputs.sha }}

  post-ci:
    needs: [ release, update, ci ]
    name: Post CI - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Needs Result
        id: needs-result
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "::set-output name=result::$result"
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Post Release Actions
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        run: |
          npm run rp-release --ignore-scripts --if-present \${{ join(needs.release.outputs.release-flags, ' ') }}

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
    "node-workspace"
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
!**/.gitignore
!/.eslintrc.js
!/.eslintrc.local.*
!/.gitignore
!/bin/
!/CHANGELOG*
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/scripts/
!/tap-snapshots/
!/test/

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
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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
!**/.gitignore
!/.eslintrc.js
!/.eslintrc.local.*
!/.gitignore
!/bin/
!/CHANGELOG*
!/docs/
!/lib/
!/LICENSE*
!/map.js
!/package.json
!/README*
!/scripts/
!/tap-snapshots/
!/test/

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
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
  }
}
`

exports[`test/apply/source-snapshots.js TAP workspaces with nested content path > expect resolving Promise 1`] = `
content_dir/index.js
========================================
module.exports={}

content_dir2/index.js
========================================
module.exports={}

package.json
========================================
{
  "templateOSS": {
    "content": "content_dir",
    "defaultContent": false,
    "version": "{{VERSION}}"
  },
  "name": "testpkg",
  "version": "1.0.0",
  "workspaces": [
    "workspaces/a"
  ]
}

workspaces/a/package.json
========================================
{
  "templateOSS": {
    "content": "../../content_dir2",
    "version": "{{VERSION}}"
  },
  "name": "a",
  "version": "1.0.0"
}
`
