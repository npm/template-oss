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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Lint All"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        if: steps.check.outputs.check_id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Test All"
          MATRIX_NAME: " - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        run: npm test --ignore-scripts
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: steps.check.outputs.check_id && always()
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
          ref: \${{ github.event.pull_request.head.ref }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "::set-output name=workspace::-w \${dependabot_dir#/}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "::set-output name=message::$prefix: postinstall for dependabot template-oss PR"

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
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        run: |
          echo '\${{ github.event.pull_request.title }}' | npx --offline commitlint -V

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_dispatch:
    inputs:
      release-pr:
        description: a release PR number to rerun release jobs on
        type: string
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
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
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
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          script: |
            const { REF_NAME, PR_NUMBER: issue_number } = process.env
            const { runId, repo: { owner, repo } } = context

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            let commentId = comments.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${issue_number}/n/\`/\`/\`\`

            if (commentId) {
              await github.rest.issues.updateComment({ owner, repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ owner, repo, issue_number, body })
              commentId = comment?.id
            }

            return commentId
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-sha
        id: check-output
        env:
          JOB_NAME: "Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.release.outputs.pr-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          output: \${{ steps.check-output.outputs.result }}

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
          npm exec --offline -- template-oss-release-manager --lockfile=false
          npm run rp-pull-request --ignore-scripts --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.commit.outputs.sha
        id: check-output
        env:
          JOB_NAME: "Update - Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.commit.outputs.sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.commit.outputs.sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          output: \${{ steps.check-output.outputs.result }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: needs.release.outputs.check-id && always()
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
        if: needs.update.outputs.check-id && always()
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
      - name: Create Release PR Comment
        uses: actions/github-script@v6
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const releaseComments = comments.filter(c => c.user.login === 'github-actions[bot]' && c.body.includes('Release is at'))

            for (const comment of releaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            await github.rest.issues.createComment({ 
              owner,
              repo,
              issue_number,
              body: \`\${body}- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            })

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: View in Registry
        run: |
          EXIT_CODE=0

          function is_published {
            if npm view "$@" --loglevel=error > /dev/null; then
              echo 0
            else
              echo 1
            fi
          }

          for release in $(echo '\${{ needs.release.outputs.releases }}' | jq -r '.[] | @base64'); do
            name=$(echo "$release" | base64 --decode | jq -r .pkgName)
            version=$(echo "$release" | base64 --decode | jq -r .version)
            spec="$name@$version"
            status=$(is_published "$spec")
            if [[ "$status" -eq 1 ]]; then
              echo "$spec ERROR"
              EXIT_CODE=$status
            else
              echo "$spec OK"
            fi
          done

          exit $EXIT_CODE

  post-release-integration:
    needs: [ release, release-integration ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.release && always()
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
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "::set-output name=result::$result"
      - name: Update Release PR Comment
        uses: actions/github-script@v6
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { PR_NUMBER: issue_number, RESULT } = process.env
            const { runId, repo: { owner, repo } } = context

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const updateComment = comments.find(c =>
              c.user.login === 'github-actions[bot]' &&
              c.body.startsWith('## Release Workflow/n/n') &&
              c.body.includes(runId)
            )

            if (updateComment) {
              console.log('Found comment to update:', JSON.stringify(updateComment, null, 2))
              let body = updateComment.body.replace(/Workflow run: :[a-z_]+:/, \`Workflow run: :\${RESULT}:\`)
              if (RESULT === 'x') {
                body += \`/n/n:rotating_light:\`
                body += \` @npm/cli-team: The post-release workflow failed for this release.\`
                body += \` Manual steps may need to be taken after examining the workflow output\`
                body += \` from the above workflow run. :rotating_light:\`
              }
              await github.rest.issues.updateComment({
                owner,
                repo,
                body,
                comment_id: updateComment.id,
              })
            } else {
              console.log('No matching comments found:', JSON.stringify(comments, null, 2))
            }

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

GitHub takes the security of our software products and services seriously, including the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

If you believe you have found a security vulnerability in this GitHub-owned open source repository, you can report it to us in one of two ways. 

If the vulnerability you have found is *not* [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) or if you do not wish to be considered for a bounty reward, please report the issue to us directly using [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Lint All"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        run: npm run lint --ignore-scripts -ws -iwr --if-present
      - name: Post Lint
        run: npm run postlint --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: steps.check.outputs.check_id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Test All"
          MATRIX_NAME: " - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        if: steps.check.outputs.check_id && always()
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
      - workspaces/a/**
      - workspaces/b/**
  push:
    branches:
      - main
      - latest
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
          ref: \${{ github.event.pull_request.head.ref }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "::set-output name=workspace::-w \${dependabot_dir#/}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "::set-output name=message::$prefix: postinstall for dependabot template-oss PR"

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
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        run: |
          echo '\${{ github.event.pull_request.title }}' | npx --offline commitlint -V

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_dispatch:
    inputs:
      release-pr:
        description: a release PR number to rerun release jobs on
        type: string
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
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
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
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          script: |
            const { REF_NAME, PR_NUMBER: issue_number } = process.env
            const { runId, repo: { owner, repo } } = context

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            let commentId = comments.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${issue_number}/n/\`/\`/\`\`

            if (commentId) {
              await github.rest.issues.updateComment({ owner, repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ owner, repo, issue_number, body })
              commentId = comment?.id
            }

            return commentId
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-sha
        id: check-output
        env:
          JOB_NAME: "Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.release.outputs.pr-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          output: \${{ steps.check-output.outputs.result }}

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
          npm exec --offline -- template-oss-release-manager --lockfile=false
          npm run rp-pull-request --ignore-scripts -ws -iwr --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.commit.outputs.sha
        id: check-output
        env:
          JOB_NAME: "Update - Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.commit.outputs.sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.commit.outputs.sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          output: \${{ steps.check-output.outputs.result }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: needs.release.outputs.check-id && always()
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
        if: needs.update.outputs.check-id && always()
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
      - name: Create Release PR Comment
        uses: actions/github-script@v6
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const releaseComments = comments.filter(c => c.user.login === 'github-actions[bot]' && c.body.includes('Release is at'))

            for (const comment of releaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            await github.rest.issues.createComment({ 
              owner,
              repo,
              issue_number,
              body: \`\${body}- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            })

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: View in Registry
        run: |
          EXIT_CODE=0

          function is_published {
            if npm view "$@" --loglevel=error > /dev/null; then
              echo 0
            else
              echo 1
            fi
          }

          for release in $(echo '\${{ needs.release.outputs.releases }}' | jq -r '.[] | @base64'); do
            name=$(echo "$release" | base64 --decode | jq -r .pkgName)
            version=$(echo "$release" | base64 --decode | jq -r .version)
            spec="$name@$version"
            status=$(is_published "$spec")
            if [[ "$status" -eq 1 ]]; then
              echo "$spec ERROR"
              EXIT_CODE=$status
            else
              echo "$spec OK"
            fi
          done

          exit $EXIT_CODE

  post-release-integration:
    needs: [ release, release-integration ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.release && always()
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
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "::set-output name=result::$result"
      - name: Update Release PR Comment
        uses: actions/github-script@v6
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { PR_NUMBER: issue_number, RESULT } = process.env
            const { runId, repo: { owner, repo } } = context

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const updateComment = comments.find(c =>
              c.user.login === 'github-actions[bot]' &&
              c.body.startsWith('## Release Workflow/n/n') &&
              c.body.includes(runId)
            )

            if (updateComment) {
              console.log('Found comment to update:', JSON.stringify(updateComment, null, 2))
              let body = updateComment.body.replace(/Workflow run: :[a-z_]+:/, \`Workflow run: :\${RESULT}:\`)
              if (RESULT === 'x') {
                body += \`/n/n:rotating_light:\`
                body += \` @npm/cli-team: The post-release workflow failed for this release.\`
                body += \` Manual steps may need to be taken after examining the workflow output\`
                body += \` from the above workflow run. :rotating_light:\`
              }
              await github.rest.issues.updateComment({
                owner,
                repo,
                body,
                comment_id: updateComment.id,
              })
            } else {
              console.log('No matching comments found:', JSON.stringify(comments, null, 2))
            }

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

GitHub takes the security of our software products and services seriously, including the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

If you believe you have found a security vulnerability in this GitHub-owned open source repository, you can report it to us in one of two ways. 

If the vulnerability you have found is *not* [in scope for the GitHub Bug Bounty Program](https://bounty.github.com/#scope) or if you do not wish to be considered for a bounty reward, please report the issue to us directly using [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Lint All"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Lint All
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        run: npm run lint --ignore-scripts -ws -iwr --if-present
      - name: Post Lint
        run: npm run postlint --ignore-scripts -ws -iwr --if-present
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: steps.check.outputs.check_id && always()
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check_id: \${{ steps.check.outputs.check_id }}

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
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: inputs.check-sha
        id: check-output
        env:
          JOB_NAME: "Test All"
          MATRIX_NAME: " - \${{ matrix.platform.name }} - \${{ matrix.node-version }}"
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.check-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: inputs.check-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Test All - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
          sha: \${{ inputs.check-sha }}
          output: \${{ steps.check-output.outputs.result }}
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
        if: steps.check.outputs.check_id && always()
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
          ref: \${{ github.event.pull_request.head.ref }}
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
          dependabot_dir="\${{ steps.metadata.outputs.directory }}"
          if [[ "$dependabot_dir" == "/" ]]; then
            echo "::set-output name=workspace::-iwr"
          else
            # strip leading slash from directory so it works as a
            # a path to the workspace flag
            echo "::set-output name=workspace::-w \${dependabot_dir#/}"
          fi

      - name: Apply Changes
        if: steps.flags.outputs.workspace
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.flags.outputs.workspace }}
          if [[ \`git status --porcelain\` ]]; then
            echo "::set-output name=changes::true"
          fi
          # This only sets the conventional commit prefix. This workflow can't reliably determine
          # what the breaking change is though. If a BREAKING CHANGE message is required then
          # this PR check will fail and the commit will be amended with stafftools
          if [[ "\${{ steps.metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
            prefix='feat!'
          else
            prefix='chore'
          fi
          echo "::set-output name=message::$prefix: postinstall for dependabot template-oss PR"

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
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to \${{ github.event.pull_request.head.sha }}
      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        run: |
          echo '\${{ github.event.pull_request.title }}' | npx --offline commitlint -V

.github/workflows/release.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release

on:
  workflow_dispatch:
    inputs:
      release-pr:
        description: a release PR number to rerun release jobs on
        type: string
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
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
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
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"
      - name: Post Pull Request Comment
        if: steps.release.outputs.pr-number
        uses: actions/github-script@v6
        id: pr-comment
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          script: |
            const { REF_NAME, PR_NUMBER: issue_number } = process.env
            const { runId, repo: { owner, repo } } = context

            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })

            let body = '## Release Manager/n/n'

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            let commentId = comments.find(c => c.user.login === 'github-actions[bot]' && c.body.startsWith(body))?.id

            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${issue_number}/n/\`/\`/\`\`

            if (commentId) {
              await github.rest.issues.updateComment({ owner, repo, comment_id: commentId, body })
            } else {
              const { data: comment } = await github.rest.issues.createComment({ owner, repo, issue_number, body })
              commentId = comment?.id
            }

            return commentId
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-sha
        id: check-output
        env:
          JOB_NAME: "Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.release.outputs.pr-sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.release.outputs.pr-sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.release.outputs.pr-sha }}
          output: \${{ steps.check-output.outputs.result }}

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
          npm exec --offline -- template-oss-release-manager --lockfile=false
          npm run rp-pull-request --ignore-scripts -ws -iwr --if-present
      - name: Commit
        id: commit
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          git commit --all --amend --no-edit || true
          git push --force-with-lease
          echo "::set-output  name=sha::$(git rev-parse HEAD)"
      - name: Get Workflow Job
        uses: actions/github-script@v6
        if: steps.commit.outputs.sha
        id: check-output
        env:
          JOB_NAME: "Update - Release"
          MATRIX_NAME: ""
        with:
          script: |
            const { owner, repo } = context.repo

            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner,
              repo,
              run_id: context.runId,
              per_page: 100
            })

            const jobName = process.env.JOB_NAME + process.env.MATRIX_NAME
            const job = data.jobs.find(j => j.name.endsWith(jobName))
            const jobUrl = job?.html_url

            const shaUrl = \`\${context.serverUrl}/\${owner}/\${repo}/commit/\${{ steps.commit.outputs.sha }}\`

            let summary = \`This check is assosciated with \${shaUrl}/n/n\`

            if (jobUrl) {
              summary += \`For run logs, click here: \${jobUrl}\`
            } else {
              summary += \`Run logs could not be found for a job with name: "\${jobName}"\`
            }

            return { summary }
      - name: Create Check
        uses: LouisBrunner/checks-action@v1.3.1
        id: check
        if: steps.commit.outputs.sha
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          status: in_progress
          name: Release
          sha: \${{ steps.commit.outputs.sha }}
          output: \${{ steps.check-output.outputs.result }}
      - name: Conclude Check
        uses: LouisBrunner/checks-action@v1.3.1
        if: needs.release.outputs.check-id && always()
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
        if: needs.update.outputs.check-id && always()
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
      - name: Create Release PR Comment
        uses: actions/github-script@v6
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const releaseComments = comments.filter(c => c.user.login === 'github-actions[bot]' && c.body.includes('Release is at'))

            for (const comment of releaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            const runUrl = \`https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            await github.rest.issues.createComment({ 
              owner,
              repo,
              issue_number,
              body: \`\${body}- Workflow run: :arrows_counterclockwise: \${runUrl}\`,
            })

  release-integration:
    needs: release
    name: Release Integration
    if: needs.release.outputs.release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - name: Install npm@latest
        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
      - name: npm Version
        run: npm -v
      - name: View in Registry
        run: |
          EXIT_CODE=0

          function is_published {
            if npm view "$@" --loglevel=error > /dev/null; then
              echo 0
            else
              echo 1
            fi
          }

          for release in $(echo '\${{ needs.release.outputs.releases }}' | jq -r '.[] | @base64'); do
            name=$(echo "$release" | base64 --decode | jq -r .pkgName)
            version=$(echo "$release" | base64 --decode | jq -r .version)
            spec="$name@$version"
            status=$(is_published "$spec")
            if [[ "$status" -eq 1 ]]; then
              echo "$spec ERROR"
              EXIT_CODE=$status
            else
              echo "$spec OK"
            fi
          done

          exit $EXIT_CODE

  post-release-integration:
    needs: [ release, release-integration ]
    name: Post Release Integration - Release
    if: github.repository_owner == 'npm' && needs.release.outputs.release && always()
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
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "::set-output name=result::$result"
      - name: Update Release PR Comment
        uses: actions/github-script@v6
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { PR_NUMBER: issue_number, RESULT } = process.env
            const { runId, repo: { owner, repo } } = context

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            const updateComment = comments.find(c =>
              c.user.login === 'github-actions[bot]' &&
              c.body.startsWith('## Release Workflow/n/n') &&
              c.body.includes(runId)
            )

            if (updateComment) {
              console.log('Found comment to update:', JSON.stringify(updateComment, null, 2))
              let body = updateComment.body.replace(/Workflow run: :[a-z_]+:/, \`Workflow run: :\${RESULT}:\`)
              if (RESULT === 'x') {
                body += \`/n/n:rotating_light:\`
                body += \` @npm/cli-team: The post-release workflow failed for this release.\`
                body += \` Manual steps may need to be taken after examining the workflow output\`
                body += \` from the above workflow run. :rotating_light:\`
              }
              await github.rest.issues.updateComment({
                owner,
                repo,
                body,
                comment_id: updateComment.id,
              })
            } else {
              console.log('No matching comments found:', JSON.stringify(comments, null, 2))
            }

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
