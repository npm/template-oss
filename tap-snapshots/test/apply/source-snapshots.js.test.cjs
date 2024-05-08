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
    'subject-case': [0],
    'body-max-line-length': [0],
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
    'tap-testdir*/',
  ],
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Create Check'
inputs:
  name:
    required: true
  token:
    required: true
  sha:
    required: true
  check-name:
    default: ''
outputs:
  check-id:
    value: \${{ steps.create-check.outputs.check_id }}
runs:
  using: "composite"
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v7
      id: workflow
      env:
        JOB_NAME: "\${{ inputs.name }}"
        SHA: "\${{ inputs.sha }}"
      with:
        result-encoding: string
        script: |
          const { repo: { owner, repo}, runId, serverUrl } = context          
          const { JOB_NAME, SHA } = process.env

          const job = await github.rest.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: runId,
            per_page: 100
          }).then(r => r.data.jobs.find(j => j.name.endsWith(JOB_NAME)))

          return [
            \`This check is assosciated with \${serverUrl}/\${owner}/\${repo}/commit/\${SHA}.\`,
            'Run logs:',
            job?.html_url || \`could not be found for a job ending with: "\${JOB_NAME}"\`,
          ].join(' ')
    - name: Create Check
      uses: LouisBrunner/checks-action@v1.6.0
      id: create-check
      with:
        token: \${{ inputs.token }}
        sha: \${{ inputs.sha }}
        status: in_progress
        name: \${{ inputs.check-name || inputs.name }}
        output: |
          {"summary":"\${{ steps.workflow.outputs.result }}"}

.github/actions/install-latest-npm/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Install Latest npm'
description: 'Install the latest version of npm compatible with the Node version'
inputs:
  node:
    description: 'Current Node version'
    required: true
runs:
  using: "composite"
  steps:
    # node 10/12/14 ship with npm@6, which is known to fail when updating itself in windows
    - name: Update Windows npm
      if: |
        runner.os == 'Windows' && (
          startsWith(inputs.node, 'v10.') ||
          startsWith(inputs.node, 'v12.') ||
          startsWith(inputs.node, 'v14.')
        )
      shell: cmd
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package
    - name: Install Latest npm
      shell: bash
      env:
        NODE_VERSION: \${{ inputs.node }}
      working-directory: \${{ runner.temp }}
      run: |
        MATCH=""
        SPECS=("latest" "next-10" "next-9" "next-8" "next-7" "next-6")

        echo "node@$NODE_VERSION"

        for SPEC in \${SPECS[@]}; do
          ENGINES=$(npm view npm@$SPEC --json | jq -r '.engines.node')
          echo "Checking if node@$NODE_VERSION satisfies npm@$SPEC ($ENGINES)"

          if npx semver -r "$ENGINES" "$NODE_VERSION" > /dev/null; then
            MATCH=$SPEC
            echo "Found compatible version: npm@$MATCH"
            break
          fi  
        done

        if [ -z $MATCH ]; then
          echo "Could not find a compatible version of npm for node@$NODE_VERSION"
          exit 1
        fi

        npm i --prefer-online --no-fund --no-audit -g npm@$MATCH
    - name: npm Version
      shell: bash
      run: npm -v

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
    target-branch: "main"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    target-branch: "latest"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10

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

.github/settings.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

repository:
  allow_merge_commit: false
  allow_rebase_merge: true
  allow_squash_merge: true
  squash_merge_commit_title: PR_TITLE
  squash_merge_commit_message: PR_BODY
  delete_branch_on_merge: true
  enable_automated_security_fixes: true
  enable_vulnerability_alerts: true

branches:
  - name: main
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]
  - name: latest
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]

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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund --package-lock
      - name: Run Production Audit
        run: npm audit --omit=dev
      - name: Run Full Audit
        run: npm audit --audit-level=none

.github/workflows/ci-release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI - Release

on:
  workflow_dispatch:
    inputs:
      ref:
        required: true
        type: string
        default: main
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
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Lint All"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

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
      - release/v*
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  push:
    branches:
      - main
      - latest
      - release/v*
  pull_request:
    branches:
      - main
      - latest
      - release/v*
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
        uses: actions/checkout@v4
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
        uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "workspace=-iwr" >> $GITHUB_OUTPUT
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "workspace=-w \${dependabot_dir#/}" >> $GITHUB_OUTPUT
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "changes=true" >> $GITHUB_OUTPUT
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT

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
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.changes && steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # Check if all the necessary template-oss changes were applied. Since we continued
      # on errors in one of the previous steps, this check will fail if our follow up
      # only applied a portion of the changes and we need to followup manually.
      #
      # Note that this used to run \`lint\` and \`postlint\` but that will fail this action
      # if we've also shipped any linting changes separate from template-oss. We do
      # linting in another action, so we want to fail this one only if there are
      # template-oss changes that could not be applied.
      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

      - name: Fail on Breaking Change
        if: steps.apply.outputs.changes && startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          echo "This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          echo "for more information on how to fix this with a BREAKING CHANGE footer."
          exit 1

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
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: echo "$PR_TITLE" | npx --offline commitlint -V

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_dispatch:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'
  workflow_call:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'

jobs:
  publish:
    name: Check Publish
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Check If Published
        run: |
          EXIT_CODE=0

          for release in $(echo $RELEASES | jq -r '.[] | @base64'); do
            SPEC="$(echo "$release" | base64 --decode | jq -r .pkgName)@$(echo "$release" | base64 --decode | jq -r .version)"
            npm view "$SPEC" --json
            STATUS=$?
            if [[ "$STATUS" -eq 1 ]]; then
              EXIT_CODE=$STATUS
              echo "$SPEC ERROR"
            else
              echo "$SPEC OK"
            fi
          done

          exit $EXIT_CODE

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest
      - release/v*

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      pr-sha: \${{ steps.release.outputs.pr-sha }}
      releases: \${{ steps.release.outputs.releases }}
      comment-id: \${{ steps.create-comment.outputs.comment-id || steps.update-comment.outputs.comment-id }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx --offline template-oss-release-please --branch="\${{ github.ref_name }}" --backport="" --defaultTag="latest"
      - name: Create Release Manager Comment Text
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v7
        id: comment-text
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            return['## Release Manager', \`Release workflow run: \${workflow.html_url}\`].join('/n/n')
      - name: Find Release Manager Comment
        uses: peter-evans/find-comment@v2
        if: steps.release.outputs.pr-number
        id: found-comment
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Manager'
      - name: Create Release Manager Comment
        id: create-comment
        if: steps.release.outputs.pr-number && !steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          body: \${{ steps.comment-text.outputs.result }}
      - name: Update Release Manager Comment
        id: update-comment
        if: steps.release.outputs.pr-number && steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        with:
          name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.release.outputs.pr-sha }}

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.pr-branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Create Release Manager Checklist Text
        id: comment-text
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm exec --offline -- template-oss-release-manager --pr="\${{ needs.release.outputs.pr-number }}" --backport="" --defaultTag="latest"
      - name: Append Release Manager Comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ needs.release.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'append'
      - name: Run Post Pull Request Actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm run rp-pull-request --ignore-scripts --if-present -- --pr="\${{ needs.release.outputs.pr-number }}" --commentId="\${{ needs.release.outputs.comment-id }}"
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        with:
          name: "Update - Release"
          check-name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.commit.outputs.sha }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
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
      ref: \${{ needs.release.outputs.pr-branch }}
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
      - name: Get CI Conclusion
        id: conclusion
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.conclusion.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    outputs:
      comment-id: \${{ steps.create-comment.outputs.comment-id }}
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Release PR Comment Text
        id: comment-text
        uses: actions/github-script@v7
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber
            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`

            return [
              '## Release Workflow/n',
              ...releases.map(r => \`- /\`\${r.pkgName}@\${r.version}/\` \${r.url}\`),
              \`- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            ].join('/n')
      - name: Create Release PR Comment
        id: create-comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          body: \${{ steps.comment-text.outputs.result }}

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.releases
    uses: ./.github/workflows/release-integration.yml
    with:
      releases: \${{ needs.release.outputs.releases }}

  post-release-integration:
    needs: [ release, release-integration, post-release ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Post Release Conclusion
        id: conclusion
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Find Release PR Comment
        uses: peter-evans/find-comment@v2
        id: found-comment
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Workflow'
      - name: Create Release PR Comment Text
        id: comment-text
        if: steps.found-comment.outputs.comment-id
        uses: actions/github-script@v7
        env:
          RESULT: \${{ steps.conclusion.outputs.result }}
          BODY: \${{ steps.found-comment.outputs.comment-body }}
        with:
          result-encoding: string
          script: |
            const { RESULT, BODY } = process.env
            const body = [BODY.replace(/(Workflow run: :)[a-z_]+(:)/, \`$1\${RESULT}$2\`)]
            if (RESULT !== 'white_check_mark') {
              body.push(':rotating_light::rotating_light::rotating_light:')
              body.push([
                '@npm/cli-team: The post-release workflow failed for this release.',
                'Manual steps may need to be taken after examining the workflow output.'
              ].join(' '))
              body.push(':rotating_light::rotating_light::rotating_light:')
            }
            return body.join('/n/n').trim()
      - name: Update Release PR Comment
        if: steps.comment-text.outputs.result
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*
# transient test directories
tap-testdir*/

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
!/CONTRIBUTING.md
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
!/tsconfig.json

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

CONTRIBUTING.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

# Contributing

## Code of Conduct

All interactions in the **npm** organization on GitHub are considered to be covered by our standard [Code of Conduct](https://docs.npmjs.com/policies/conduct).

## Reporting Bugs

Before submitting a new bug report please search for an existing or similar report.

Use one of our existing issue templates if you believe you've come across a unique problem.

Duplicate issues, or issues that don't use one of our templates may get closed without a response.

## Pull Request Conventions

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

When opening a pull request please be sure that either the pull request title, or each commit in the pull request, has one of the following prefixes:

 - \`feat\`: For when introducing a new feature.  The result will be a new semver minor version of the package when it is next published.
 - \`fix\`: For bug fixes. The result will be a new semver patch version of the package when it is next published.
 - \`docs\`: For documentation updates.  The result will be a new semver patch version of the package when it is next published.
 - \`chore\`: For changes that do not affect the published module.  Often these are changes to tests.  The result will be *no* change to the version of the package when it is next published (as the commit does not affect the published version).

### Test Coverage

Pull requests made against this repo will run \`npm test\` automatically.  Please make sure tests pass locally before submitting a PR.

Every new feature or bug fix should come with a corresponding test or tests that validate the solutions. Testing also reports on code coverage and will fail if code coverage drops.

### Linting

Linting is also done automatically once tests pass.  \`npm run lintfix\` will fix most linting errors automatically.

Please make sure linting passes before submitting a PR.

## What _not_ to contribute?

### Dependencies

It should be noted that our team does not accept third-party dependency updates/PRs.  If you submit a PR trying to update our dependencies we will close it with or without a reference to these contribution guidelines.

### Tools/Automation

Our core team is responsible for the maintenance of the tooling/automation in this project and we ask contributors to not make changes to these when contributing (e.g. \`.github/*\`, \`.eslintrc.json\`, \`.licensee.json\`).  Most of those files also have a header at the top to remind folks they are automatically generated.  Pull requests that alter these will not be accepted.

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "scripts": {
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
      "section": "Chores",
      "hidden": true
    }
  ],
  "prerelease-type": "pre",
  "packages": {
    ".": {
      "package-name": ""
    }
  }
}

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

GitHub takes the security of our software products and services seriously, including the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

If you believe you have found a security vulnerability in this GitHub-owned open source repository, you can report it to us in one of two ways. 

If the vulnerability you have found is *not* [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) or if you do not wish to be considered for a bounty reward, please report the issue to us directly through [opensource-security@github.com](mailto:opensource-security@github.com).

If the vulnerability you have found is [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) and you would like for your finding to be considered for a bounty reward, please submit the vulnerability to us through [HackerOne](https://hackerone.com/github) in order to be eligible to receive a bounty award.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Thanks for helping make GitHub safe for everyone.
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
    'subject-case': [0],
    'body-max-line-length': [0],
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
    'tap-testdir*/',
    'workspaces/a/**',
    'workspaces/b/**',
  ],
  extends: [
    '@npmcli',
    ...localConfigs,
  ],
}

.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Create Check'
inputs:
  name:
    required: true
  token:
    required: true
  sha:
    required: true
  check-name:
    default: ''
outputs:
  check-id:
    value: \${{ steps.create-check.outputs.check_id }}
runs:
  using: "composite"
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v7
      id: workflow
      env:
        JOB_NAME: "\${{ inputs.name }}"
        SHA: "\${{ inputs.sha }}"
      with:
        result-encoding: string
        script: |
          const { repo: { owner, repo}, runId, serverUrl } = context          
          const { JOB_NAME, SHA } = process.env

          const job = await github.rest.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: runId,
            per_page: 100
          }).then(r => r.data.jobs.find(j => j.name.endsWith(JOB_NAME)))

          return [
            \`This check is assosciated with \${serverUrl}/\${owner}/\${repo}/commit/\${SHA}.\`,
            'Run logs:',
            job?.html_url || \`could not be found for a job ending with: "\${JOB_NAME}"\`,
          ].join(' ')
    - name: Create Check
      uses: LouisBrunner/checks-action@v1.6.0
      id: create-check
      with:
        token: \${{ inputs.token }}
        sha: \${{ inputs.sha }}
        status: in_progress
        name: \${{ inputs.check-name || inputs.name }}
        output: |
          {"summary":"\${{ steps.workflow.outputs.result }}"}

.github/actions/install-latest-npm/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Install Latest npm'
description: 'Install the latest version of npm compatible with the Node version'
inputs:
  node:
    description: 'Current Node version'
    required: true
runs:
  using: "composite"
  steps:
    # node 10/12/14 ship with npm@6, which is known to fail when updating itself in windows
    - name: Update Windows npm
      if: |
        runner.os == 'Windows' && (
          startsWith(inputs.node, 'v10.') ||
          startsWith(inputs.node, 'v12.') ||
          startsWith(inputs.node, 'v14.')
        )
      shell: cmd
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package
    - name: Install Latest npm
      shell: bash
      env:
        NODE_VERSION: \${{ inputs.node }}
      working-directory: \${{ runner.temp }}
      run: |
        MATCH=""
        SPECS=("latest" "next-10" "next-9" "next-8" "next-7" "next-6")

        echo "node@$NODE_VERSION"

        for SPEC in \${SPECS[@]}; do
          ENGINES=$(npm view npm@$SPEC --json | jq -r '.engines.node')
          echo "Checking if node@$NODE_VERSION satisfies npm@$SPEC ($ENGINES)"

          if npx semver -r "$ENGINES" "$NODE_VERSION" > /dev/null; then
            MATCH=$SPEC
            echo "Found compatible version: npm@$MATCH"
            break
          fi  
        done

        if [ -z $MATCH ]; then
          echo "Could not find a compatible version of npm for node@$NODE_VERSION"
          exit 1
        fi

        npm i --prefer-online --no-fund --no-audit -g npm@$MATCH
    - name: npm Version
      shell: bash
      run: npm -v

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
    target-branch: "main"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    target-branch: "latest"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10

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

.github/settings.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

repository:
  allow_merge_commit: false
  allow_rebase_merge: true
  allow_squash_merge: true
  squash_merge_commit_title: PR_TITLE
  squash_merge_commit_message: PR_BODY
  delete_branch_on_merge: true
  enable_automated_security_fixes: true
  enable_vulnerability_alerts: true

branches:
  - name: main
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]
  - name: latest
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]

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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund --package-lock
      - name: Run Production Audit
        run: npm audit --omit=dev
      - name: Run Full Audit
        run: npm audit --audit-level=none

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
      - release/v*
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -w a
      - name: Post Lint
        run: npm run postlint --ignore-scripts -w a

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
      - release/v*
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -w b
      - name: Post Lint
        run: npm run postlint --ignore-scripts -w b

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
  workflow_dispatch:
    inputs:
      ref:
        required: true
        type: string
        default: main
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
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Lint All"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -ws -iwr --if-present
      - name: Post Lint
        run: npm run postlint --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
  pull_request:
    paths-ignore:
      - workspaces/a/**
      - workspaces/b/**
  push:
    branches:
      - main
      - latest
      - release/v*
    paths-ignore:
      - workspaces/a/**
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts
      - name: Post Lint
        run: npm run postlint --ignore-scripts

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  push:
    branches:
      - main
      - latest
      - release/v*
  pull_request:
    branches:
      - main
      - latest
      - release/v*
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
        uses: actions/checkout@v4
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
        uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "workspace=-iwr" >> $GITHUB_OUTPUT
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "workspace=-w \${dependabot_dir#/}" >> $GITHUB_OUTPUT
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "changes=true" >> $GITHUB_OUTPUT
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT

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
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.changes && steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # Check if all the necessary template-oss changes were applied. Since we continued
      # on errors in one of the previous steps, this check will fail if our follow up
      # only applied a portion of the changes and we need to followup manually.
      #
      # Note that this used to run \`lint\` and \`postlint\` but that will fail this action
      # if we've also shipped any linting changes separate from template-oss. We do
      # linting in another action, so we want to fail this one only if there are
      # template-oss changes that could not be applied.
      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

      - name: Fail on Breaking Change
        if: steps.apply.outputs.changes && startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          echo "This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          echo "for more information on how to fix this with a BREAKING CHANGE footer."
          exit 1

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
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: echo "$PR_TITLE" | npx --offline commitlint -V

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_dispatch:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'
  workflow_call:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'

jobs:
  publish:
    name: Check Publish
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Check If Published
        run: |
          EXIT_CODE=0

          for release in $(echo $RELEASES | jq -r '.[] | @base64'); do
            SPEC="$(echo "$release" | base64 --decode | jq -r .pkgName)@$(echo "$release" | base64 --decode | jq -r .version)"
            npm view "$SPEC" --json
            STATUS=$?
            if [[ "$STATUS" -eq 1 ]]; then
              EXIT_CODE=$STATUS
              echo "$SPEC ERROR"
            else
              echo "$SPEC OK"
            fi
          done

          exit $EXIT_CODE

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest
      - release/v*

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      pr-sha: \${{ steps.release.outputs.pr-sha }}
      releases: \${{ steps.release.outputs.releases }}
      comment-id: \${{ steps.create-comment.outputs.comment-id || steps.update-comment.outputs.comment-id }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx --offline template-oss-release-please --branch="\${{ github.ref_name }}" --backport="" --defaultTag="latest"
      - name: Create Release Manager Comment Text
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v7
        id: comment-text
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            return['## Release Manager', \`Release workflow run: \${workflow.html_url}\`].join('/n/n')
      - name: Find Release Manager Comment
        uses: peter-evans/find-comment@v2
        if: steps.release.outputs.pr-number
        id: found-comment
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Manager'
      - name: Create Release Manager Comment
        id: create-comment
        if: steps.release.outputs.pr-number && !steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          body: \${{ steps.comment-text.outputs.result }}
      - name: Update Release Manager Comment
        id: update-comment
        if: steps.release.outputs.pr-number && steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        with:
          name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.release.outputs.pr-sha }}

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.pr-branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Create Release Manager Checklist Text
        id: comment-text
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm exec --offline -- template-oss-release-manager --pr="\${{ needs.release.outputs.pr-number }}" --backport="" --defaultTag="latest"
      - name: Append Release Manager Comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ needs.release.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'append'
      - name: Run Post Pull Request Actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm run rp-pull-request --ignore-scripts -ws -iwr --if-present -- --pr="\${{ needs.release.outputs.pr-number }}" --commentId="\${{ needs.release.outputs.comment-id }}"
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        with:
          name: "Update - Release"
          check-name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.commit.outputs.sha }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
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
      ref: \${{ needs.release.outputs.pr-branch }}
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
      - name: Get CI Conclusion
        id: conclusion
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.conclusion.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    outputs:
      comment-id: \${{ steps.create-comment.outputs.comment-id }}
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Release PR Comment Text
        id: comment-text
        uses: actions/github-script@v7
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber
            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`

            return [
              '## Release Workflow/n',
              ...releases.map(r => \`- /\`\${r.pkgName}@\${r.version}/\` \${r.url}\`),
              \`- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            ].join('/n')
      - name: Create Release PR Comment
        id: create-comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          body: \${{ steps.comment-text.outputs.result }}

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.releases
    uses: ./.github/workflows/release-integration.yml
    with:
      releases: \${{ needs.release.outputs.releases }}

  post-release-integration:
    needs: [ release, release-integration, post-release ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Post Release Conclusion
        id: conclusion
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Find Release PR Comment
        uses: peter-evans/find-comment@v2
        id: found-comment
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Workflow'
      - name: Create Release PR Comment Text
        id: comment-text
        if: steps.found-comment.outputs.comment-id
        uses: actions/github-script@v7
        env:
          RESULT: \${{ steps.conclusion.outputs.result }}
          BODY: \${{ steps.found-comment.outputs.comment-body }}
        with:
          result-encoding: string
          script: |
            const { RESULT, BODY } = process.env
            const body = [BODY.replace(/(Workflow run: :)[a-z_]+(:)/, \`$1\${RESULT}$2\`)]
            if (RESULT !== 'white_check_mark') {
              body.push(':rotating_light::rotating_light::rotating_light:')
              body.push([
                '@npm/cli-team: The post-release workflow failed for this release.',
                'Manual steps may need to be taken after examining the workflow output.'
              ].join(' '))
              body.push(':rotating_light::rotating_light::rotating_light:')
            }
            return body.join('/n/n').trim()
      - name: Update Release PR Comment
        if: steps.comment-text.outputs.result
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'

.gitignore
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

# ignore everything in the root
/*
# transient test directories
tap-testdir*/

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
!/CONTRIBUTING.md
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
!/tsconfig.json
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

CONTRIBUTING.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

# Contributing

## Code of Conduct

All interactions in the **npm** organization on GitHub are considered to be covered by our standard [Code of Conduct](https://docs.npmjs.com/policies/conduct).

## Reporting Bugs

Before submitting a new bug report please search for an existing or similar report.

Use one of our existing issue templates if you believe you've come across a unique problem.

Duplicate issues, or issues that don't use one of our templates may get closed without a response.

## Pull Request Conventions

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

When opening a pull request please be sure that either the pull request title, or each commit in the pull request, has one of the following prefixes:

 - \`feat\`: For when introducing a new feature.  The result will be a new semver minor version of the package when it is next published.
 - \`fix\`: For bug fixes. The result will be a new semver patch version of the package when it is next published.
 - \`docs\`: For documentation updates.  The result will be a new semver patch version of the package when it is next published.
 - \`chore\`: For changes that do not affect the published module.  Often these are changes to tests.  The result will be *no* change to the version of the package when it is next published (as the commit does not affect the published version).

### Test Coverage

Pull requests made against this repo will run \`npm test\` automatically.  Please make sure tests pass locally before submitting a PR.

Every new feature or bug fix should come with a corresponding test or tests that validate the solutions. Testing also reports on code coverage and will fail if code coverage drops.

### Linting

Linting is also done automatically once tests pass.  \`npm run lintfix\` will fix most linting errors automatically.

Please make sure linting passes before submitting a PR.

## What _not_ to contribute?

### Dependencies

It should be noted that our team does not accept third-party dependency updates/PRs.  If you submit a PR trying to update our dependencies we will close it with or without a reference to these contribution guidelines.

### Tools/Automation

Our core team is responsible for the maintenance of the tooling/automation in this project and we ask contributors to not make changes to these when contributing (e.g. \`.github/*\`, \`.eslintrc.json\`, \`.licensee.json\`).  Most of those files also have a header at the top to remind folks they are automatically generated.  Pull requests that alter these will not be accepted.

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
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  },
  "tap": {
    "test-ignore": "^(workspaces/a|workspaces/b)/",
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
    "node-workspace",
    "node-workspace-format"
  ],
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
      "section": "Chores",
      "hidden": true
    }
  ],
  "prerelease-type": "pre",
  "packages": {
    ".": {
      "package-name": "",
      "exclude-paths": [
        "workspaces/a",
        "workspaces/b"
      ]
    },
    "workspaces/a": {},
    "workspaces/b": {}
  }
}

SECURITY.md
========================================
<!-- This file is automatically added by @npmcli/template-oss. Do not edit. -->

GitHub takes the security of our software products and services seriously, including the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

If you believe you have found a security vulnerability in this GitHub-owned open source repository, you can report it to us in one of two ways. 

If the vulnerability you have found is *not* [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) or if you do not wish to be considered for a bounty reward, please report the issue to us directly through [opensource-security@github.com](mailto:opensource-security@github.com).

If the vulnerability you have found is [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) and you would like for your finding to be considered for a bounty reward, please submit the vulnerability to us through [HackerOne](https://hackerone.com/github) in order to be eligible to receive a bounty award.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Thanks for helping make GitHub safe for everyone.

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
  ignorePatterns: [
    'tap-testdir*/',
  ],
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
# transient test directories
tap-testdir*/

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
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
  ignorePatterns: [
    'tap-testdir*/',
  ],
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
# transient test directories
tap-testdir*/

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
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Create Check'
inputs:
  name:
    required: true
  token:
    required: true
  sha:
    required: true
  check-name:
    default: ''
outputs:
  check-id:
    value: \${{ steps.create-check.outputs.check_id }}
runs:
  using: "composite"
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v7
      id: workflow
      env:
        JOB_NAME: "\${{ inputs.name }}"
        SHA: "\${{ inputs.sha }}"
      with:
        result-encoding: string
        script: |
          const { repo: { owner, repo}, runId, serverUrl } = context          
          const { JOB_NAME, SHA } = process.env

          const job = await github.rest.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: runId,
            per_page: 100
          }).then(r => r.data.jobs.find(j => j.name.endsWith(JOB_NAME)))

          return [
            \`This check is assosciated with \${serverUrl}/\${owner}/\${repo}/commit/\${SHA}.\`,
            'Run logs:',
            job?.html_url || \`could not be found for a job ending with: "\${JOB_NAME}"\`,
          ].join(' ')
    - name: Create Check
      uses: LouisBrunner/checks-action@v1.6.0
      id: create-check
      with:
        token: \${{ inputs.token }}
        sha: \${{ inputs.sha }}
        status: in_progress
        name: \${{ inputs.check-name || inputs.name }}
        output: |
          {"summary":"\${{ steps.workflow.outputs.result }}"}

.github/actions/install-latest-npm/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: 'Install Latest npm'
description: 'Install the latest version of npm compatible with the Node version'
inputs:
  node:
    description: 'Current Node version'
    required: true
runs:
  using: "composite"
  steps:
    # node 10/12/14 ship with npm@6, which is known to fail when updating itself in windows
    - name: Update Windows npm
      if: |
        runner.os == 'Windows' && (
          startsWith(inputs.node, 'v10.') ||
          startsWith(inputs.node, 'v12.') ||
          startsWith(inputs.node, 'v14.')
        )
      shell: cmd
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package
    - name: Install Latest npm
      shell: bash
      env:
        NODE_VERSION: \${{ inputs.node }}
      working-directory: \${{ runner.temp }}
      run: |
        MATCH=""
        SPECS=("latest" "next-10" "next-9" "next-8" "next-7" "next-6")

        echo "node@$NODE_VERSION"

        for SPEC in \${SPECS[@]}; do
          ENGINES=$(npm view npm@$SPEC --json | jq -r '.engines.node')
          echo "Checking if node@$NODE_VERSION satisfies npm@$SPEC ($ENGINES)"

          if npx semver -r "$ENGINES" "$NODE_VERSION" > /dev/null; then
            MATCH=$SPEC
            echo "Found compatible version: npm@$MATCH"
            break
          fi  
        done

        if [ -z $MATCH ]; then
          echo "Could not find a compatible version of npm for node@$NODE_VERSION"
          exit 1
        fi

        npm i --prefer-online --no-fund --no-audit -g npm@$MATCH
    - name: npm Version
      shell: bash
      run: npm -v

.github/dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

version: 2

updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    target-branch: "main"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    target-branch: "latest"
    allow:
      - dependency-type: direct
    versioning-strategy: increase-if-necessary
    commit-message:
      prefix: deps
      prefix-development: chore
    labels:
      - "Dependencies"
    open-pull-requests-limit: 10

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

.github/settings.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

repository:
  allow_merge_commit: false
  allow_rebase_merge: true
  allow_squash_merge: true
  squash_merge_commit_title: PR_TITLE
  squash_merge_commit_message: PR_BODY
  delete_branch_on_merge: true
  enable_automated_security_fixes: true
  enable_vulnerability_alerts: true

branches:
  - name: main
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]
  - name: latest
    protection:
      required_status_checks: null
      enforce_admins: true
      block_creations: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
        require_last_push_approval: true
        dismiss_stale_reviews: true
      restrictions:
        apps: []
        users: []
        teams: [ "cli-team" ]

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
      - release/v*
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -w a
      - name: Post Lint
        run: npm run postlint --ignore-scripts -w a

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
      - release/v*
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
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -w b
      - name: Post Lint
        run: npm run postlint --ignore-scripts -w b

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
  workflow_dispatch:
    inputs:
      ref:
        required: true
        type: string
        default: main
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
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Lint All"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Lint
        run: npm run lint --ignore-scripts -ws -iwr --if-present
      - name: Post Lint
        run: npm run postlint --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

  test-all:
    name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
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
          - name: macOS
            os: macos-13
            shell: bash
          - name: Windows
            os: windows-latest
            shell: cmd
        node-version:
          - 22.x
        exclude:
          - platform: { name: macOS, os: macos-13, shell: bash }
            node-version: 22.x
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Create Check
        id: create-check
        if: \${{ inputs.check-sha }}
        uses: ./.github/actions/create-check
        with:
          name: "Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ inputs.check-sha }}
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: \${{ matrix.node-version }}
          check-latest: contains(matrix.node-version, '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Add Problem Matcher
        run: echo "::add-matcher::.github/matchers/tap.json"
      - name: Test
        run: npm test --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        if: steps.create-check.outputs.check-id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.create-check.outputs.check-id }}

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
        uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.ref }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "workspace=-iwr" >> $GITHUB_OUTPUT
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "workspace=-w \${dependabot_dir#/}" >> $GITHUB_OUTPUT
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "changes=true" >> $GITHUB_OUTPUT
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT

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
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.changes && steps.push.outcome == 'failure'
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # Check if all the necessary template-oss changes were applied. Since we continued
      # on errors in one of the previous steps, this check will fail if our follow up
      # only applied a portion of the changes and we need to followup manually.
      #
      # Note that this used to run \`lint\` and \`postlint\` but that will fail this action
      # if we've also shipped any linting changes separate from template-oss. We do
      # linting in another action, so we want to fail this one only if there are
      # template-oss changes that could not be applied.
      - name: Check Changes
        if: steps.apply.outputs.changes
        run: |
          npm exec --offline \${{ steps.flags.outputs.workspace }} -- template-oss-check

      - name: Fail on Breaking Change
        if: steps.apply.outputs.changes && startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          echo "This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          echo "for more information on how to fix this with a BREAKING CHANGE footer."
          exit 1

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
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: echo "$PR_TITLE" | npx --offline commitlint -V

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_dispatch:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'
  workflow_call:
    inputs:
      releases:
        required: true
        type: string
        description: 'A json array of releases. Required fields: publish: tagName, publishTag. publish check: pkgName, version'

jobs:
  publish:
    name: Check Publish
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Check If Published
        run: |
          EXIT_CODE=0

          for release in $(echo $RELEASES | jq -r '.[] | @base64'); do
            SPEC="$(echo "$release" | base64 --decode | jq -r .pkgName)@$(echo "$release" | base64 --decode | jq -r .version)"
            npm view "$SPEC" --json
            STATUS=$?
            if [[ "$STATUS" -eq 1 ]]; then
              EXIT_CODE=$STATUS
              echo "$SPEC ERROR"
            else
              echo "$SPEC OK"
            fi
          done

          exit $EXIT_CODE

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  push:
    branches:
      - main
      - latest
      - release/v*

permissions:
  contents: write
  pull-requests: write
  checks: write

jobs:
  release:
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      pr-sha: \${{ steps.release.outputs.pr-sha }}
      releases: \${{ steps.release.outputs.releases }}
      comment-id: \${{ steps.create-comment.outputs.comment-id || steps.update-comment.outputs.comment-id }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx --offline template-oss-release-please --branch="\${{ github.ref_name }}" --backport="" --defaultTag="latest"
      - name: Create Release Manager Comment Text
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v7
        id: comment-text
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            return['## Release Manager', \`Release workflow run: \${workflow.html_url}\`].join('/n/n')
      - name: Find Release Manager Comment
        uses: peter-evans/find-comment@v2
        if: steps.release.outputs.pr-number
        id: found-comment
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Manager'
      - name: Create Release Manager Comment
        id: create-comment
        if: steps.release.outputs.pr-number && !steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ steps.release.outputs.pr-number }}
          body: \${{ steps.comment-text.outputs.result }}
      - name: Update Release Manager Comment
        id: update-comment
        if: steps.release.outputs.pr-number && steps.found-comment.outputs.comment-id
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        with:
          name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.release.outputs.pr-sha }}

  update:
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.create-check.outputs.check-id }}
    name: Update - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.pr
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: \${{ needs.release.outputs.pr-branch }}
      - name: Setup Git User
        run: |
          git config --global user.email "npm-cli+bot@github.com"
          git config --global user.name "npm CLI robot"
      - name: Setup Node
        uses: actions/setup-node@v4
        id: node
        with:
          node-version: 22.x
          check-latest: contains('22.x', '.x')
      - name: Install Latest npm
        uses: ./.github/actions/install-latest-npm
        with:
          node: \${{ steps.node.outputs.node-version }}
      - name: Install Dependencies
        run: npm i --ignore-scripts --no-audit --no-fund
      - name: Create Release Manager Checklist Text
        id: comment-text
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm exec --offline -- template-oss-release-manager --pr="\${{ needs.release.outputs.pr-number }}" --backport="" --defaultTag="latest"
      - name: Append Release Manager Comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ needs.release.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'append'
      - name: Run Post Pull Request Actions
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm run rp-pull-request --ignore-scripts -ws -iwr --if-present -- --pr="\${{ needs.release.outputs.pr-number }}" --commentId="\${{ needs.release.outputs.comment-id }}"
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
      - name: Create Check
        id: create-check
        uses: ./.github/actions/create-check
        with:
          name: "Update - Release"
          check-name: "Release"
          token: \${{ secrets.GITHUB_TOKEN }}
          sha: \${{ steps.commit.outputs.sha }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
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
      ref: \${{ needs.release.outputs.pr-branch }}
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
      - name: Get CI Conclusion
        id: conclusion
        run: |
          result=""
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.6.0
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.conclusion.outputs.result }}
          check_id: \${{ needs.update.outputs.check-id }}

  post-release:
    needs: release
    outputs:
      comment-id: \${{ steps.create-comment.outputs.comment-id }}
    name: Post Release - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Create Release PR Comment Text
        id: comment-text
        uses: actions/github-script@v7
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber
            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`

            return [
              '## Release Workflow/n',
              ...releases.map(r => \`- /\`\${r.pkgName}@\${r.version}/\` \${r.url}\`),
              \`- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            ].join('/n')
      - name: Create Release PR Comment
        id: create-comment
        uses: peter-evans/create-or-update-comment@v3
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          body: \${{ steps.comment-text.outputs.result }}

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.releases
    uses: ./.github/workflows/release-integration.yml
    with:
      releases: \${{ needs.release.outputs.releases }}

  post-release-integration:
    needs: [ release, release-integration, post-release ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.releases && always()
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Get Post Release Conclusion
        id: conclusion
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT
      - name: Find Release PR Comment
        uses: peter-evans/find-comment@v2
        id: found-comment
        with:
          issue-number: \${{ fromJSON(needs.release.outputs.releases)[0].prNumber }}
          comment-author: 'github-actions[bot]'
          body-includes: '## Release Workflow'
      - name: Create Release PR Comment Text
        id: comment-text
        if: steps.found-comment.outputs.comment-id
        uses: actions/github-script@v7
        env:
          RESULT: \${{ steps.conclusion.outputs.result }}
          BODY: \${{ steps.found-comment.outputs.comment-body }}
        with:
          result-encoding: string
          script: |
            const { RESULT, BODY } = process.env
            const body = [BODY.replace(/(Workflow run: :)[a-z_]+(:)/, \`$1\${RESULT}$2\`)]
            if (RESULT !== 'white_check_mark') {
              body.push(':rotating_light::rotating_light::rotating_light:')
              body.push([
                '@npm/cli-team: The post-release workflow failed for this release.',
                'Manual steps may need to be taken after examining the workflow output.'
              ].join(' '))
              body.push(':rotating_light::rotating_light::rotating_light:')
            }
            return body.join('/n/n').trim()
      - name: Update Release PR Comment
        if: steps.comment-text.outputs.result
        uses: peter-evans/create-or-update-comment@v3
        with:
          comment-id: \${{ steps.found-comment.outputs.comment-id }}
          body: \${{ steps.comment-text.outputs.result }}
          edit-mode: 'replace'

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
    "node-workspace-format"
  ],
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
      "section": "Chores",
      "hidden": true
    }
  ],
  "prerelease-type": "pre",
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
  ignorePatterns: [
    'tap-testdir*/',
  ],
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
# transient test directories
tap-testdir*/

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
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
  ignorePatterns: [
    'tap-testdir*/',
  ],
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
# transient test directories
tap-testdir*/

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
    "lint": "eslint /"**/*.{js,cjs,ts,mjs,jsx,tsx}/"",
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
