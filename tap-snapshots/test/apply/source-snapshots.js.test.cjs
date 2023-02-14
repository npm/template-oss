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

.github/actions/audit/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

runs:
  using: composite
  steps:
    - name: Run Full Audit
      id: all
      shell: bash
      run: |
        if ! npm audit; then
          COUNT=$(npm audit --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::warning title=All Vulnerabilities::Found $COUNT vulnerabilities"
        fi

    - name: Run Production Audit
      id: production
      shell: bash
      run: |
        if ! npm audit --omit=dev; then
          COUNT=$(npm audit --omit=dev --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::error title=Production Vulnerabilities::Found $COUNT production vulnerabilities"
          exit 1
        fi

.github/actions/changed-files/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Files

inputs:
  token:
    description: GitHub token to use
    required: true

outputs:
  names:
    value: \${{ steps.files.outputs.result }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: actions/github-script@v6
      id: files
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { repo: { owner, repo }, eventName, payload, sha } = context
          let files
          if (eventName === 'pull_request' || eventName === 'pull_request_target') {
            files = await github.paginate(github.rest.pulls.listFiles, {
              owner,
              repo,
              pull_number: payload.pull_request.number,
            })
          } else {
            const { data: commit } = await github.rest.repos.getCommit({
              owner,
              repo,
              ref: sha,
            })
            files = commit.files
          }
          return files.map(f => f.filename)

.github/actions/changed-workspaces/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Workspaces

inputs:
  token:
    description: GitHub token to use
  files:
    description: json stringified array of file names or --all

outputs:
  flags:
    value: \${{ steps.workspaces.outputs.flags }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: ./.github/actions/changed-files
      if: \${{ !inputs.files }}
      id: files
      with:
        token: \${{ inputs.token }}

    - name: Get Workspaces
      shell: bash
      id: workspaces
      run: |
        flags=$(npm exec --offline -- template-oss-changed-workspaces '\${{ inputs.files || steps.files.outputs.names }}')
        echo "flags=\${flags}" >> $GITHUB_OUTPUT

.github/actions/conclude-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Conclude Check
description: Conclude a check

inputs:
  token:
    description: GitHub token to use
    required: true
  conclusion:
    description: conclusion of check
    require: true
  check-id:
    description: id of check to conclude
    required: true

runs:
  using: composite
  steps:
    - name: Conclude Check
      uses: LouisBrunner/checks-action@v1.5.0
      with:
        token: \${{ inputs.token }}
        conclusion: \${{ inputs.conclusion }}
        check_id: \${{ inputs.check-id }}

.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Create Check
description: Create a check and associate it with a sha

inputs:
  token:
    description: GitHub token to use
    required: true
  sha:
    description: sha to attach the check to
    required: true
  job-name:
    description: Name of the job to find
    required: true
  job-status:
    description: Status of the check being created
    default: 'in_progress'

outputs:
  check-id:
    description: The ID of the check that was created
    value: \${{ steps.check.outputs.check_id }}

runs:
  using: composite
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v6
      id: workflow-job
      env:
        JOB_NAME: \${{ inputs.job-name }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { JOB_NAME } = process.env
          const { repo: { owner, repo }, runId, serverUrl } = context

          const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {
            owner,
            repo,
            run_id: runId,
          }).then(jobs => jobs.map(j => ({ name: j.name, html_url: j.html_url })))

          console.log(\`found jobs: \${JSON.stringify(jobs, null, 2)}\`)

          const job = jobs.find(j => j.name.endsWith(JOB_NAME))

          console.log(\`found job: \${JSON.stringify(job, null, 2)}\`)

          const shaUrl = \`\${serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.sha }}\`
          const summary = \`This check is assosciated with \${shaUrl}/n/n\`
          const message = job?.html_url
            ? \`For run logs, click here: \${job.html_url}\`
            : \`Run logs could not be found for a job with name: "\${JOB_NAME}"\`

          // Return a json object with properties that LouisBrunner/checks-actions
          // expects as the output of the check
          return { summary: summary + message }

    - name: Create Check
      uses: LouisBrunner/checks-action@v1.5.0
      id: check
      with:
        token: \${{ inputs.token }}
        status: \${{ inputs.job-status }}
        name: \${{ inputs.job-name }}
        sha: \${{ inputs.sha }}
        output: \${{ steps.workflow-job.outputs.result }}

.github/actions/deps/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Dependencies

inputs:
  command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  flags:
    description: extra flags to pass to the dependencies step
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Install Dependencies
      shell: \${{ inputs.shell }}
      run: npm \${{ inputs.command }} \${{ inputs.flags }}

.github/actions/lint/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Lint

inputs:
  flags:
    description: flags to pass to the commands
    default: ''

runs:
  using: composite
  steps:
    - name: Lint
      shell: bash
      run: |
        npm run lint --ignore-scripts \${{ inputs.flags }}
    - name: Post Lint
      shell: bash
      run: |
        npm run postlint --ignore-scripts \${{ inputs.flags }}

.github/actions/setup/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Setup Repo
description: Setup a repo with standard tools

inputs:
  node-version:
    description: node version to use
    default: '18.x'
  npm-version:
    description: npm version to use
    default: 'latest'
  cache:
    description: whether to cache npm install or not
    default: 'false'
  shell:
    description: shell to run on
    default: 'bash'
  deps:
    description: whether to run the deps step
    default: 'true'
  deps-command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  deps-flags:
    description: extra flags to pass to the dependencies step

runs:
  using: composite
  steps:
    - name: Setup Git User
      shell: \${{ inputs.shell }}
      run: |
        git config --global user.email "npm-cli+bot@github.com"
        git config --global user.name "npm CLI robot"

    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: \${{ inputs.node-version }}
        cache: \${{ (inputs.cache == 'true' && 'npm') || '' }}

    - name: Check Node Version
      if: inputs.npm-version
      id: node-version
      shell: bash
      run: |
        NODE_VERSION=$(node --version)
        echo $NODE_VERSION
        if npx semver@7 -r "<=10" "$NODE_VERSION"; then
          echo "ten-or-lower=true" >> $GITHUB_OUTPUT
        fi
        if npx semver@7 -r "<=14" "$NODE_VERSION"; then
          echo "fourteen-or-lower=true" >> $GITHUB_OUTPUT
        fi

    - name: Update Windows npm
      # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
      if: inputs.npm-version && runner.os == 'Windows' && steps.node-version.outputs.fourteen-or-lower
      shell: \${{ inputs.shell }}
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package

    - name: Install npm@7
      if: inputs.npm-version && steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@7

    - name: Install npm@\${{ inputs.npm-version }}
      if: inputs.npm-version && !steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@\${{ inputs.npm-version }}

    - name: npm Version
      shell: \${{ inputs.shell }}
      run: npm -v

    - name: Setup Dependencies
      if: inputs.deps == 'true'
      uses: ./.github/actions/deps
      with:
        command: \${{ inputs.deps-command }}
        flags: \${{ inputs.deps-flags }}
        shell: \${{ inputs.shell }}

    - name: Add Problem Matcher
      shell: bash
      run: |
        [[ -f ./.github/matchers/tap.json ]] && echo "::add-matcher::.github/matchers/tap.json"

.github/actions/test/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Test

inputs:
  flags:
    description: flags to pass to the commands
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Test
      shell: \${{ inputs.shell }}
      run: npm test --ignore-scripts \${{ inputs.flags }}

.github/actions/upsert-comment/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Upsert Comment
description: Update or create a comment

inputs:
  token:
    description: GitHub token to use
    required: true
  number:
    description: Number of the issue or pull request
    required: true
  login:
    description: Login name of user to look for comments from
    default: 'github-actions[bot]'
    required: true
  body:
    description: Body of the comment, the first line will be used to match to an existing comment
    required: true
  find:
    description: string to find in body
  replace:
    description: string to replace in body
  append:
    description: string to append to the body
  includes:
    description: A string that the comment needs to include

outputs:
  comment-id:
    description: The ID of the comment
    value: \${{ steps.comment.outputs.result }}

runs:
  using: composite
  steps:
    - name: Create or Update Comment
      uses: actions/github-script@v6
      id: comment
      env:
        NUMBER: \${{ inputs.number }}
        BODY: \${{ inputs.body }}
        FIND: \${{ inputs.find }}
        REPLACE: \${{ inputs.replace }}
        APPEND: \${{ inputs.append }}
        LOGIN: \${{ inputs.login }}
        INCLUDES: \${{ inputs.includes }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { BODY, FIND, REPLACE, APPEND, LOGIN, NUMBER: issue_number, INCLUDES } = process.env
          const { repo: { owner, repo } } = context
          const TITLE = BODY.split('/n')[0].trim() + '/n'
          const bodyIncludes = (c) => INCLUDES ? c.body.includes(INCLUDES) : true

          const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

          console.log(\`Looking for comment with: \${JSON.stringify({ LOGIN, TITLE, INCLUDES }, null, 2)}\`)
          console.log(\`Found comments: \${JSON.stringify(comments, null, 2)}\`)

          const comment = comments.find(c =>
            c.login === LOGIN &&
            c.body.startsWith(TITLE) &&
            bodyIncludes(c)
          )

          if (comment) {
            console.log(\`Found comment: \${JSON.stringify(comment, null, 2)}\`)
            let newBody = FIND && REPLACE ? comment.body.replace(new RegExp(FIND, 'g'), REPLACE) : BODY
            if (APPEND) {
              newBody += APPEND
            }
            await github.rest.issues.updateComment({ owner, repo, comment_id: comment.id, body: newBody })
            return comment.id
          }

          if (FIND || REPLACE || APPEND) {
            console.log('Could not find a comment to use find/replace or append to')
            return
          }

          console.log('Creating new comment')

          const res = await github.rest.issues.createComment({ owner, repo, issue_number, body: BODY })
          return res.data.id

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
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  schedule:
    # "At 09:00 UTC (01:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  audit:
    name: Audit Dependencies
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Audit Dependencies

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps-flags: "--package-lock"

      - name: Audit
        uses: ./.github/actions/audit

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
    inputs:
      all:
        type: boolean
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
      all:
        type: boolean
  pull_request:
    branches:
      - main
      - latest
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 10:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_10_*_*_1
    - cron: "0 10 * * 1"

jobs:
  lint:
    name: Lint
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint

      - name: Setup
        id: setup
        uses: ./.github/actions/setup

      - name: Get Changed Workspaces
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Lint
        uses: ./.github/actions/lint
        with:
          flags: \${{ steps.workspaces.outputs.flags }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}

      - name: Continue Matrix Run
        id: continue-matrix
        shell: bash
        run: |
          if [[ "\${{ matrix.node-version }}" == "14.17.0" || "\${{ inputs.all }}" == "true" ]]; then
            echo "result=true" >> $GITHUB_OUTPUT
          fi

      - name: Setup
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/setup
        id: setup
        with:
          node-version: \${{ matrix.node-version }}
          shell: \${{ matrix.platform.shell }}

      - name: Get Changed Workspaces
        if: steps.continue-matrix.outputs.result
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Test
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/test
        with:
          flags: \${{ steps.workspaces.outputs.flags }}
          shell: \${{ matrix.platform.shell }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  workflow_dispatch:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  push:
    branches:
      - main
      - latest
  pull_request:
    branches:
      - main
      - latest
  schedule:
    # "At 11:00 UTC (03:00 PT) on Monday" https://crontab.guru/#0_11_*_*_1
    - cron: "0 11 * * 1"

jobs:
  analyze:
    name: Analyze
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    permissions:
      actions: read
      contents: read
      security-events: write
      checks: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Analyze

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on:
  pull_request:
    branches:
      - main
      - latest
      - release/v*

jobs:
  dependency:
    name: "@npmcli/template-oss"
    permissions:
      contents: write
    outputs:
      sha: \${{ steps.sha.outputs.sha }}
    # TODO: remove head_ref check after testing
    if: github.repository_owner == 'npm' && (github.actor == 'dependabot[bot]' || contains(github.head_ref, '/npm-cli/template-oss'))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        continue-on-error: true
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # TODO: remove step after testing
      - name: Fake Dependabot Metadata
        id: fake-metadata
        if: steps.metadata.outcome == 'failure'
        run: |
          echo "dependency-names=@npmcli/template-oss" >> $GITHUB_OUTPUT
          echo "directory=/" >> $GITHUB_OUTPUT
          echo "update-type=version-update:semver-patch" >> $GITHUB_OUTPUT

      - name: Is Dependency
        if: contains(steps.metadata.outputs.dependency-names || steps.fake-metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: dependency
        run: echo "continue=true" >> $GITHUB_OUTPUT

      - name: Checkout
        if: steps.dependency.outputs.continue
        uses: actions/checkout@v3
        with:
          ref: \${{ (github.event_name == 'pull_request' && github.event.pull_request.head.ref) || '' }}

      - name: Setup
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/setup

      - name: Get Workspaces
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/changed-workspaces
        id: workspaces
        with:
          files: '["\${{ steps.metadata.outputs.directory || steps.fake-metadata.outputs.directory }}"]'

      # This only sets the conventional commit prefix. This workflow can't reliably determine
      # what the breaking change is though. If a BREAKING CHANGE message is required then
      # this PR check will fail and the commit will be amended with stafftools
      - name: Apply Changes
        if: steps.workspaces.outputs.flags
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.workspaces.outputs.flags }}
          if [[ \`git status --porcelain\` ]]; then
            if [[ "\${{ steps.metadata.outputs.update-type || steps.fake-metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
              prefix='feat!'
            else
              prefix='chore'
            fi
            echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.message
        id: push
        continue-on-error: true
        run: |
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.message && steps.push.outcome == 'failure'
        id: push-on-error
        continue-on-error: true
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If template-oss is applying breaking changes, then we fail this PR with a message saying what to do. There's no need
      # to run CI in this case because the PR will need to be fixed manually so CI will run on those commits.
      - name: Fail on Breaking Change
        if: startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          TITLE="Breaking Changes"
          MESSAGE="This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          MESSAGE="$MESSAGE for more information on how to fix this with a BREAKING CHANGE footer."
          echo "::error title=$TITLE::$MESSAGE"
          exit 1

      - name: Get SHA
        id: sha
        run: echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

  # If everything succeeded so far then we run our normal CI workflow since GitHub actions wont rerun after a bot
  # pushes a new commit to a PR. We rerun all of CI because template-oss could affect any code in the repo including
  # lint settings and test settings.
  ci:
    name: CI
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  codeql-analysis:
    name: CodeQL
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/codeql-analysis.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  pull-request:
    name: Pull Request
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/pull-request.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request

on:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  pull_request:
    branches:
      - main
      - latest
      - release/v*
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  commitlint:
    name: Lint Commits
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint Commits

      - name: Setup
        uses: ./.github/actions/setup

      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: |
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to '\${{ github.event.pull_request.head.sha }}'

      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          echo "$PR_TITLE" | npx --offline commitlint -V

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_call:
    inputs:
      release:
        required: true
        type: string
      releases:
        required: true
        type: string

jobs:
  check-registry:
    name: Check Registry
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps: false

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
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.comment-id }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup

      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"

      # If we have opened a release PR, then immediately create an "in_progress"
      # check for it so the GitHub UI doesn't report that its mergeable.
      # This check will be swapped out for real CI checks once those are started.
      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        id: check
        with:
          sha: \${{ steps.release.outputs.pr-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Comment Text
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-number
        id: comment-text
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            let body = '## Release Manager/n/n'
            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${process.env.REF_NAME} -R \${owner}/\${repo} -f release-pr=\${process.env.PR_NUMBER}/n/\`/\`/\`\`
            return body

      - name: Post Pull Request Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        id: pr-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ steps.release.outputs.pr-number }}

  update:
    name: Release PR - Update
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    if: needs.release.outputs.pr
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}
          fetch-depth: 0

      - name: Setup
        uses: ./.github/actions/setup

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
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.commit.outputs.sha
        id: check
        with:
          sha: \${{ steps.vommit.outputs.sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: needs.release.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ needs.release.outputs.check-id }}

  ci:
    name: Release PR - CI
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ needs.release.outputs.pr-branch }}
      check-sha: \${{ needs.update.outputs.sha }}
      all: true

  post-ci:
    name: Release PR - Post CI
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, update, ci ]
    if: needs.update.outputs.check-id && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check-id: \${{ needs.update.outputs.check-id }}

  post-release:
    name: Post Release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: release
    if: needs.release.outputs.releases
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
              .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

            console.log(\`comments: \${JSON.stringify(comments, null, 2)}\`)

            const releasePleaseComments = comments.filter(c =>
              c.login === 'github-actions[bot]' &&
              c.body.startsWith(':robot: Release is at ')
            )

            console.log(\`release please comments: \${JSON.stringify(releasePleaseComments, null, 2)}\`)

            for (const comment of releasePleaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }
            body += \`- Workflow run: :arrows_counterclockwise: https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            return body

      - name: Create Release PR Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

  release-integration:
    name: Post Release - Integration
    needs: release
    if: needs.release.outputs.release
    uses: ./.github/workflows/release-integration.yml
    with:
      release: needs.release.outputs.release
      releases: needs.release.outputs.releases

  post-release-integration:
    name: Post Release - Post Integration
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, release-integration ]
    if: needs.release.outputs.release && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          REF_NAME: \${{ github.ref_name }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { RESULT, PR_NUMBER, REF_NAME } = process.env
            const tagCodeowner = RESULT !== 'white_check_mark'
            if (tagCodeowner) {
              let body = ''
              body += \`/n/n:rotating_light:\`
              body += \` @npm/cli-team: The post-release workflow failed for this release.\`
              body += \` Manual steps may need to be taken after examining the workflow output\`
              body += \` from the above workflow run. :rotating_light:\`
              body += \`/n/nTo rerun the workflow run the following command:/n/n\`
              body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${PR_NUMBER}/n/\`/\`/\`\`
              return body
            }

      - name: Update Release PR Comment
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: "## Release Workflow"
          find: "Workflow run: :[a-z_]+:"
          replace: "Workflow run :\${{ steps.needs-result.outputs.result }}:"
          append: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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
  "version": "1.0.0",
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  }
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

.github/actions/audit/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

runs:
  using: composite
  steps:
    - name: Run Full Audit
      id: all
      shell: bash
      run: |
        if ! npm audit; then
          COUNT=$(npm audit --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::warning title=All Vulnerabilities::Found $COUNT vulnerabilities"
        fi

    - name: Run Production Audit
      id: production
      shell: bash
      run: |
        if ! npm audit --omit=dev; then
          COUNT=$(npm audit --omit=dev --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::error title=Production Vulnerabilities::Found $COUNT production vulnerabilities"
          exit 1
        fi

.github/actions/changed-files/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Files

inputs:
  token:
    description: GitHub token to use
    required: true

outputs:
  names:
    value: \${{ steps.files.outputs.result }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: actions/github-script@v6
      id: files
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { repo: { owner, repo }, eventName, payload, sha } = context
          let files
          if (eventName === 'pull_request' || eventName === 'pull_request_target') {
            files = await github.paginate(github.rest.pulls.listFiles, {
              owner,
              repo,
              pull_number: payload.pull_request.number,
            })
          } else {
            const { data: commit } = await github.rest.repos.getCommit({
              owner,
              repo,
              ref: sha,
            })
            files = commit.files
          }
          return files.map(f => f.filename)

.github/actions/changed-workspaces/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Workspaces

inputs:
  token:
    description: GitHub token to use
  files:
    description: json stringified array of file names or --all

outputs:
  flags:
    value: \${{ steps.workspaces.outputs.flags }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: ./.github/actions/changed-files
      if: \${{ !inputs.files }}
      id: files
      with:
        token: \${{ inputs.token }}

    - name: Get Workspaces
      shell: bash
      id: workspaces
      run: |
        flags=$(npm exec --offline -- template-oss-changed-workspaces '\${{ inputs.files || steps.files.outputs.names }}')
        echo "flags=\${flags}" >> $GITHUB_OUTPUT

.github/actions/conclude-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Conclude Check
description: Conclude a check

inputs:
  token:
    description: GitHub token to use
    required: true
  conclusion:
    description: conclusion of check
    require: true
  check-id:
    description: id of check to conclude
    required: true

runs:
  using: composite
  steps:
    - name: Conclude Check
      uses: LouisBrunner/checks-action@v1.5.0
      with:
        token: \${{ inputs.token }}
        conclusion: \${{ inputs.conclusion }}
        check_id: \${{ inputs.check-id }}

.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Create Check
description: Create a check and associate it with a sha

inputs:
  token:
    description: GitHub token to use
    required: true
  sha:
    description: sha to attach the check to
    required: true
  job-name:
    description: Name of the job to find
    required: true
  job-status:
    description: Status of the check being created
    default: 'in_progress'

outputs:
  check-id:
    description: The ID of the check that was created
    value: \${{ steps.check.outputs.check_id }}

runs:
  using: composite
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v6
      id: workflow-job
      env:
        JOB_NAME: \${{ inputs.job-name }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { JOB_NAME } = process.env
          const { repo: { owner, repo }, runId, serverUrl } = context

          const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {
            owner,
            repo,
            run_id: runId,
          }).then(jobs => jobs.map(j => ({ name: j.name, html_url: j.html_url })))

          console.log(\`found jobs: \${JSON.stringify(jobs, null, 2)}\`)

          const job = jobs.find(j => j.name.endsWith(JOB_NAME))

          console.log(\`found job: \${JSON.stringify(job, null, 2)}\`)

          const shaUrl = \`\${serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.sha }}\`
          const summary = \`This check is assosciated with \${shaUrl}/n/n\`
          const message = job?.html_url
            ? \`For run logs, click here: \${job.html_url}\`
            : \`Run logs could not be found for a job with name: "\${JOB_NAME}"\`

          // Return a json object with properties that LouisBrunner/checks-actions
          // expects as the output of the check
          return { summary: summary + message }

    - name: Create Check
      uses: LouisBrunner/checks-action@v1.5.0
      id: check
      with:
        token: \${{ inputs.token }}
        status: \${{ inputs.job-status }}
        name: \${{ inputs.job-name }}
        sha: \${{ inputs.sha }}
        output: \${{ steps.workflow-job.outputs.result }}

.github/actions/deps/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Dependencies

inputs:
  command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  flags:
    description: extra flags to pass to the dependencies step
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Install Dependencies
      shell: \${{ inputs.shell }}
      run: npm \${{ inputs.command }} \${{ inputs.flags }}

.github/actions/lint/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Lint

inputs:
  flags:
    description: flags to pass to the commands
    default: ''

runs:
  using: composite
  steps:
    - name: Lint
      shell: bash
      run: |
        npm run lint --ignore-scripts \${{ inputs.flags }}
    - name: Post Lint
      shell: bash
      run: |
        npm run postlint --ignore-scripts \${{ inputs.flags }}

.github/actions/setup/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Setup Repo
description: Setup a repo with standard tools

inputs:
  node-version:
    description: node version to use
    default: '18.x'
  npm-version:
    description: npm version to use
    default: 'latest'
  cache:
    description: whether to cache npm install or not
    default: 'false'
  shell:
    description: shell to run on
    default: 'bash'
  deps:
    description: whether to run the deps step
    default: 'true'
  deps-command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  deps-flags:
    description: extra flags to pass to the dependencies step

runs:
  using: composite
  steps:
    - name: Setup Git User
      shell: \${{ inputs.shell }}
      run: |
        git config --global user.email "npm-cli+bot@github.com"
        git config --global user.name "npm CLI robot"

    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: \${{ inputs.node-version }}
        cache: \${{ (inputs.cache == 'true' && 'npm') || '' }}

    - name: Check Node Version
      if: inputs.npm-version
      id: node-version
      shell: bash
      run: |
        NODE_VERSION=$(node --version)
        echo $NODE_VERSION
        if npx semver@7 -r "<=10" "$NODE_VERSION"; then
          echo "ten-or-lower=true" >> $GITHUB_OUTPUT
        fi
        if npx semver@7 -r "<=14" "$NODE_VERSION"; then
          echo "fourteen-or-lower=true" >> $GITHUB_OUTPUT
        fi

    - name: Update Windows npm
      # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
      if: inputs.npm-version && runner.os == 'Windows' && steps.node-version.outputs.fourteen-or-lower
      shell: \${{ inputs.shell }}
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package

    - name: Install npm@7
      if: inputs.npm-version && steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@7

    - name: Install npm@\${{ inputs.npm-version }}
      if: inputs.npm-version && !steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@\${{ inputs.npm-version }}

    - name: npm Version
      shell: \${{ inputs.shell }}
      run: npm -v

    - name: Setup Dependencies
      if: inputs.deps == 'true'
      uses: ./.github/actions/deps
      with:
        command: \${{ inputs.deps-command }}
        flags: \${{ inputs.deps-flags }}
        shell: \${{ inputs.shell }}

    - name: Add Problem Matcher
      shell: bash
      run: |
        [[ -f ./.github/matchers/tap.json ]] && echo "::add-matcher::.github/matchers/tap.json"

.github/actions/test/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Test

inputs:
  flags:
    description: flags to pass to the commands
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Test
      shell: \${{ inputs.shell }}
      run: npm test --ignore-scripts \${{ inputs.flags }}

.github/actions/upsert-comment/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Upsert Comment
description: Update or create a comment

inputs:
  token:
    description: GitHub token to use
    required: true
  number:
    description: Number of the issue or pull request
    required: true
  login:
    description: Login name of user to look for comments from
    default: 'github-actions[bot]'
    required: true
  body:
    description: Body of the comment, the first line will be used to match to an existing comment
    required: true
  find:
    description: string to find in body
  replace:
    description: string to replace in body
  append:
    description: string to append to the body
  includes:
    description: A string that the comment needs to include

outputs:
  comment-id:
    description: The ID of the comment
    value: \${{ steps.comment.outputs.result }}

runs:
  using: composite
  steps:
    - name: Create or Update Comment
      uses: actions/github-script@v6
      id: comment
      env:
        NUMBER: \${{ inputs.number }}
        BODY: \${{ inputs.body }}
        FIND: \${{ inputs.find }}
        REPLACE: \${{ inputs.replace }}
        APPEND: \${{ inputs.append }}
        LOGIN: \${{ inputs.login }}
        INCLUDES: \${{ inputs.includes }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { BODY, FIND, REPLACE, APPEND, LOGIN, NUMBER: issue_number, INCLUDES } = process.env
          const { repo: { owner, repo } } = context
          const TITLE = BODY.split('/n')[0].trim() + '/n'
          const bodyIncludes = (c) => INCLUDES ? c.body.includes(INCLUDES) : true

          const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

          console.log(\`Looking for comment with: \${JSON.stringify({ LOGIN, TITLE, INCLUDES }, null, 2)}\`)
          console.log(\`Found comments: \${JSON.stringify(comments, null, 2)}\`)

          const comment = comments.find(c =>
            c.login === LOGIN &&
            c.body.startsWith(TITLE) &&
            bodyIncludes(c)
          )

          if (comment) {
            console.log(\`Found comment: \${JSON.stringify(comment, null, 2)}\`)
            let newBody = FIND && REPLACE ? comment.body.replace(new RegExp(FIND, 'g'), REPLACE) : BODY
            if (APPEND) {
              newBody += APPEND
            }
            await github.rest.issues.updateComment({ owner, repo, comment_id: comment.id, body: newBody })
            return comment.id
          }

          if (FIND || REPLACE || APPEND) {
            console.log('Could not find a comment to use find/replace or append to')
            return
          }

          console.log('Creating new comment')

          const res = await github.rest.issues.createComment({ owner, repo, issue_number, body: BODY })
          return res.data.id

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
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  schedule:
    # "At 09:00 UTC (01:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  audit:
    name: Audit Dependencies
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Audit Dependencies

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps-flags: "--package-lock"

      - name: Audit
        uses: ./.github/actions/audit

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
    inputs:
      all:
        type: boolean
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
      all:
        type: boolean
  pull_request:
    branches:
      - main
      - latest
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 10:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_10_*_*_1
    - cron: "0 10 * * 1"

jobs:
  lint:
    name: Lint
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint

      - name: Setup
        id: setup
        uses: ./.github/actions/setup

      - name: Get Changed Workspaces
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Lint
        uses: ./.github/actions/lint
        with:
          flags: \${{ steps.workspaces.outputs.flags }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}

      - name: Continue Matrix Run
        id: continue-matrix
        shell: bash
        run: |
          if [[ "\${{ matrix.node-version }}" == "14.17.0" || "\${{ inputs.all }}" == "true" ]]; then
            echo "result=true" >> $GITHUB_OUTPUT
          fi

      - name: Setup
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/setup
        id: setup
        with:
          node-version: \${{ matrix.node-version }}
          shell: \${{ matrix.platform.shell }}

      - name: Get Changed Workspaces
        if: steps.continue-matrix.outputs.result
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Test
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/test
        with:
          flags: \${{ steps.workspaces.outputs.flags }}
          shell: \${{ matrix.platform.shell }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  workflow_dispatch:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  push:
    branches:
      - main
      - latest
  pull_request:
    branches:
      - main
      - latest
  schedule:
    # "At 11:00 UTC (03:00 PT) on Monday" https://crontab.guru/#0_11_*_*_1
    - cron: "0 11 * * 1"

jobs:
  analyze:
    name: Analyze
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    permissions:
      actions: read
      contents: read
      security-events: write
      checks: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Analyze

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on:
  pull_request:
    branches:
      - main
      - latest
      - release/v*

jobs:
  dependency:
    name: "@npmcli/template-oss"
    permissions:
      contents: write
    outputs:
      sha: \${{ steps.sha.outputs.sha }}
    # TODO: remove head_ref check after testing
    if: github.repository_owner == 'npm' && (github.actor == 'dependabot[bot]' || contains(github.head_ref, '/npm-cli/template-oss'))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        continue-on-error: true
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # TODO: remove step after testing
      - name: Fake Dependabot Metadata
        id: fake-metadata
        if: steps.metadata.outcome == 'failure'
        run: |
          echo "dependency-names=@npmcli/template-oss" >> $GITHUB_OUTPUT
          echo "directory=/" >> $GITHUB_OUTPUT
          echo "update-type=version-update:semver-patch" >> $GITHUB_OUTPUT

      - name: Is Dependency
        if: contains(steps.metadata.outputs.dependency-names || steps.fake-metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: dependency
        run: echo "continue=true" >> $GITHUB_OUTPUT

      - name: Checkout
        if: steps.dependency.outputs.continue
        uses: actions/checkout@v3
        with:
          ref: \${{ (github.event_name == 'pull_request' && github.event.pull_request.head.ref) || '' }}

      - name: Setup
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/setup

      - name: Get Workspaces
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/changed-workspaces
        id: workspaces
        with:
          files: '["\${{ steps.metadata.outputs.directory || steps.fake-metadata.outputs.directory }}"]'

      # This only sets the conventional commit prefix. This workflow can't reliably determine
      # what the breaking change is though. If a BREAKING CHANGE message is required then
      # this PR check will fail and the commit will be amended with stafftools
      - name: Apply Changes
        if: steps.workspaces.outputs.flags
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.workspaces.outputs.flags }}
          if [[ \`git status --porcelain\` ]]; then
            if [[ "\${{ steps.metadata.outputs.update-type || steps.fake-metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
              prefix='feat!'
            else
              prefix='chore'
            fi
            echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.message
        id: push
        continue-on-error: true
        run: |
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.message && steps.push.outcome == 'failure'
        id: push-on-error
        continue-on-error: true
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If template-oss is applying breaking changes, then we fail this PR with a message saying what to do. There's no need
      # to run CI in this case because the PR will need to be fixed manually so CI will run on those commits.
      - name: Fail on Breaking Change
        if: startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          TITLE="Breaking Changes"
          MESSAGE="This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          MESSAGE="$MESSAGE for more information on how to fix this with a BREAKING CHANGE footer."
          echo "::error title=$TITLE::$MESSAGE"
          exit 1

      - name: Get SHA
        id: sha
        run: echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

  # If everything succeeded so far then we run our normal CI workflow since GitHub actions wont rerun after a bot
  # pushes a new commit to a PR. We rerun all of CI because template-oss could affect any code in the repo including
  # lint settings and test settings.
  ci:
    name: CI
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  codeql-analysis:
    name: CodeQL
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/codeql-analysis.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  pull-request:
    name: Pull Request
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/pull-request.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request

on:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  pull_request:
    branches:
      - main
      - latest
      - release/v*
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  commitlint:
    name: Lint Commits
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint Commits

      - name: Setup
        uses: ./.github/actions/setup

      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: |
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to '\${{ github.event.pull_request.head.sha }}'

      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          echo "$PR_TITLE" | npx --offline commitlint -V

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_call:
    inputs:
      release:
        required: true
        type: string
      releases:
        required: true
        type: string

jobs:
  check-registry:
    name: Check Registry
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps: false

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
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.comment-id }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup

      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"

      # If we have opened a release PR, then immediately create an "in_progress"
      # check for it so the GitHub UI doesn't report that its mergeable.
      # This check will be swapped out for real CI checks once those are started.
      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        id: check
        with:
          sha: \${{ steps.release.outputs.pr-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Comment Text
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-number
        id: comment-text
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            let body = '## Release Manager/n/n'
            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${process.env.REF_NAME} -R \${owner}/\${repo} -f release-pr=\${process.env.PR_NUMBER}/n/\`/\`/\`\`
            return body

      - name: Post Pull Request Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        id: pr-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ steps.release.outputs.pr-number }}

  update:
    name: Release PR - Update
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    if: needs.release.outputs.pr
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}
          fetch-depth: 0

      - name: Setup
        uses: ./.github/actions/setup

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
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.commit.outputs.sha
        id: check
        with:
          sha: \${{ steps.vommit.outputs.sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: needs.release.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ needs.release.outputs.check-id }}

  ci:
    name: Release PR - CI
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ needs.release.outputs.pr-branch }}
      check-sha: \${{ needs.update.outputs.sha }}
      all: true

  post-ci:
    name: Release PR - Post CI
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, update, ci ]
    if: needs.update.outputs.check-id && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check-id: \${{ needs.update.outputs.check-id }}

  post-release:
    name: Post Release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: release
    if: needs.release.outputs.releases
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
              .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

            console.log(\`comments: \${JSON.stringify(comments, null, 2)}\`)

            const releasePleaseComments = comments.filter(c =>
              c.login === 'github-actions[bot]' &&
              c.body.startsWith(':robot: Release is at ')
            )

            console.log(\`release please comments: \${JSON.stringify(releasePleaseComments, null, 2)}\`)

            for (const comment of releasePleaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }
            body += \`- Workflow run: :arrows_counterclockwise: https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            return body

      - name: Create Release PR Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

  release-integration:
    name: Post Release - Integration
    needs: release
    if: needs.release.outputs.release
    uses: ./.github/workflows/release-integration.yml
    with:
      release: needs.release.outputs.release
      releases: needs.release.outputs.releases

  post-release-integration:
    name: Post Release - Post Integration
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, release-integration ]
    if: needs.release.outputs.release && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          REF_NAME: \${{ github.ref_name }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { RESULT, PR_NUMBER, REF_NAME } = process.env
            const tagCodeowner = RESULT !== 'white_check_mark'
            if (tagCodeowner) {
              let body = ''
              body += \`/n/n:rotating_light:\`
              body += \` @npm/cli-team: The post-release workflow failed for this release.\`
              body += \` Manual steps may need to be taken after examining the workflow output\`
              body += \` from the above workflow run. :rotating_light:\`
              body += \`/n/nTo rerun the workflow run the following command:/n/n\`
              body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${PR_NUMBER}/n/\`/\`/\`\`
              return body
            }

      - name: Update Release PR Comment
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: "## Release Workflow"
          find: "Workflow run: :[a-z_]+:"
          replace: "Workflow run :\${{ steps.needs-result.outputs.result }}:"
          append: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }
}
`

exports[`test/apply/source-snapshots.js TAP workspaces only > expect resolving Promise 1`] = `
.github/actions/audit/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

runs:
  using: composite
  steps:
    - name: Run Full Audit
      id: all
      shell: bash
      run: |
        if ! npm audit; then
          COUNT=$(npm audit --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::warning title=All Vulnerabilities::Found $COUNT vulnerabilities"
        fi

    - name: Run Production Audit
      id: production
      shell: bash
      run: |
        if ! npm audit --omit=dev; then
          COUNT=$(npm audit --omit=dev --audit-level=none --json | jq -r '.metadata.vulnerabilities.total')
          echo "::error title=Production Vulnerabilities::Found $COUNT production vulnerabilities"
          exit 1
        fi

.github/actions/changed-files/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Files

inputs:
  token:
    description: GitHub token to use
    required: true

outputs:
  names:
    value: \${{ steps.files.outputs.result }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: actions/github-script@v6
      id: files
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { repo: { owner, repo }, eventName, payload, sha } = context
          let files
          if (eventName === 'pull_request' || eventName === 'pull_request_target') {
            files = await github.paginate(github.rest.pulls.listFiles, {
              owner,
              repo,
              pull_number: payload.pull_request.number,
            })
          } else {
            const { data: commit } = await github.rest.repos.getCommit({
              owner,
              repo,
              ref: sha,
            })
            files = commit.files
          }
          return files.map(f => f.filename)

.github/actions/changed-workspaces/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Get Changed Workspaces

inputs:
  token:
    description: GitHub token to use
  files:
    description: json stringified array of file names or --all

outputs:
  flags:
    value: \${{ steps.workspaces.outputs.flags }}

runs:
  using: composite
  steps:
    - name: Get Changed Files
      uses: ./.github/actions/changed-files
      if: \${{ !inputs.files }}
      id: files
      with:
        token: \${{ inputs.token }}

    - name: Get Workspaces
      shell: bash
      id: workspaces
      run: |
        flags=$(npm exec --offline -- template-oss-changed-workspaces '\${{ inputs.files || steps.files.outputs.names }}')
        echo "flags=\${flags}" >> $GITHUB_OUTPUT

.github/actions/conclude-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Conclude Check
description: Conclude a check

inputs:
  token:
    description: GitHub token to use
    required: true
  conclusion:
    description: conclusion of check
    require: true
  check-id:
    description: id of check to conclude
    required: true

runs:
  using: composite
  steps:
    - name: Conclude Check
      uses: LouisBrunner/checks-action@v1.5.0
      with:
        token: \${{ inputs.token }}
        conclusion: \${{ inputs.conclusion }}
        check_id: \${{ inputs.check-id }}

.github/actions/create-check/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Create Check
description: Create a check and associate it with a sha

inputs:
  token:
    description: GitHub token to use
    required: true
  sha:
    description: sha to attach the check to
    required: true
  job-name:
    description: Name of the job to find
    required: true
  job-status:
    description: Status of the check being created
    default: 'in_progress'

outputs:
  check-id:
    description: The ID of the check that was created
    value: \${{ steps.check.outputs.check_id }}

runs:
  using: composite
  steps:
    - name: Get Workflow Job
      uses: actions/github-script@v6
      id: workflow-job
      env:
        JOB_NAME: \${{ inputs.job-name }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { JOB_NAME } = process.env
          const { repo: { owner, repo }, runId, serverUrl } = context

          const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRun, {
            owner,
            repo,
            run_id: runId,
          }).then(jobs => jobs.map(j => ({ name: j.name, html_url: j.html_url })))

          console.log(\`found jobs: \${JSON.stringify(jobs, null, 2)}\`)

          const job = jobs.find(j => j.name.endsWith(JOB_NAME))

          console.log(\`found job: \${JSON.stringify(job, null, 2)}\`)

          const shaUrl = \`\${serverUrl}/\${owner}/\${repo}/commit/\${{ inputs.sha }}\`
          const summary = \`This check is assosciated with \${shaUrl}/n/n\`
          const message = job?.html_url
            ? \`For run logs, click here: \${job.html_url}\`
            : \`Run logs could not be found for a job with name: "\${JOB_NAME}"\`

          // Return a json object with properties that LouisBrunner/checks-actions
          // expects as the output of the check
          return { summary: summary + message }

    - name: Create Check
      uses: LouisBrunner/checks-action@v1.5.0
      id: check
      with:
        token: \${{ inputs.token }}
        status: \${{ inputs.job-status }}
        name: \${{ inputs.job-name }}
        sha: \${{ inputs.sha }}
        output: \${{ steps.workflow-job.outputs.result }}

.github/actions/deps/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Dependencies

inputs:
  command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  flags:
    description: extra flags to pass to the dependencies step
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Install Dependencies
      shell: \${{ inputs.shell }}
      run: npm \${{ inputs.command }} \${{ inputs.flags }}

.github/actions/lint/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Lint

inputs:
  flags:
    description: flags to pass to the commands
    default: ''

runs:
  using: composite
  steps:
    - name: Lint
      shell: bash
      run: |
        npm run lint --ignore-scripts \${{ inputs.flags }}
    - name: Post Lint
      shell: bash
      run: |
        npm run postlint --ignore-scripts \${{ inputs.flags }}

.github/actions/setup/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Setup Repo
description: Setup a repo with standard tools

inputs:
  node-version:
    description: node version to use
    default: '18.x'
  npm-version:
    description: npm version to use
    default: 'latest'
  cache:
    description: whether to cache npm install or not
    default: 'false'
  shell:
    description: shell to run on
    default: 'bash'
  deps:
    description: whether to run the deps step
    default: 'true'
  deps-command:
    description: command to run for the dependencies step
    default: 'install --ignore-scripts --no-audit --no-fund'
  deps-flags:
    description: extra flags to pass to the dependencies step

runs:
  using: composite
  steps:
    - name: Setup Git User
      shell: \${{ inputs.shell }}
      run: |
        git config --global user.email "npm-cli+bot@github.com"
        git config --global user.name "npm CLI robot"

    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: \${{ inputs.node-version }}
        cache: \${{ (inputs.cache == 'true' && 'npm') || '' }}

    - name: Check Node Version
      if: inputs.npm-version
      id: node-version
      shell: bash
      run: |
        NODE_VERSION=$(node --version)
        echo $NODE_VERSION
        if npx semver@7 -r "<=10" "$NODE_VERSION"; then
          echo "ten-or-lower=true" >> $GITHUB_OUTPUT
        fi
        if npx semver@7 -r "<=14" "$NODE_VERSION"; then
          echo "fourteen-or-lower=true" >> $GITHUB_OUTPUT
        fi

    - name: Update Windows npm
      # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
      if: inputs.npm-version && runner.os == 'Windows' && steps.node-version.outputs.fourteen-or-lower
      shell: \${{ inputs.shell }}
      run: |
        curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
        tar xf npm-7.5.4.tgz
        cd package
        node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
        cd ..
        rmdir /s /q package

    - name: Install npm@7
      if: inputs.npm-version && steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@7

    - name: Install npm@\${{ inputs.npm-version }}
      if: inputs.npm-version && !steps.node-version.outputs.ten-or-lower
      shell: \${{ inputs.shell }}
      run: npm i --prefer-online --no-fund --no-audit -g npm@\${{ inputs.npm-version }}

    - name: npm Version
      shell: \${{ inputs.shell }}
      run: npm -v

    - name: Setup Dependencies
      if: inputs.deps == 'true'
      uses: ./.github/actions/deps
      with:
        command: \${{ inputs.deps-command }}
        flags: \${{ inputs.deps-flags }}
        shell: \${{ inputs.shell }}

    - name: Add Problem Matcher
      shell: bash
      run: |
        [[ -f ./.github/matchers/tap.json ]] && echo "::add-matcher::.github/matchers/tap.json"

.github/actions/test/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Test

inputs:
  flags:
    description: flags to pass to the commands
    default: ''
  shell:
    description: shell to run on
    default: 'bash'

runs:
  using: composite
  steps:
    - name: Test
      shell: \${{ inputs.shell }}
      run: npm test --ignore-scripts \${{ inputs.flags }}

.github/actions/upsert-comment/action.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Upsert Comment
description: Update or create a comment

inputs:
  token:
    description: GitHub token to use
    required: true
  number:
    description: Number of the issue or pull request
    required: true
  login:
    description: Login name of user to look for comments from
    default: 'github-actions[bot]'
    required: true
  body:
    description: Body of the comment, the first line will be used to match to an existing comment
    required: true
  find:
    description: string to find in body
  replace:
    description: string to replace in body
  append:
    description: string to append to the body
  includes:
    description: A string that the comment needs to include

outputs:
  comment-id:
    description: The ID of the comment
    value: \${{ steps.comment.outputs.result }}

runs:
  using: composite
  steps:
    - name: Create or Update Comment
      uses: actions/github-script@v6
      id: comment
      env:
        NUMBER: \${{ inputs.number }}
        BODY: \${{ inputs.body }}
        FIND: \${{ inputs.find }}
        REPLACE: \${{ inputs.replace }}
        APPEND: \${{ inputs.append }}
        LOGIN: \${{ inputs.login }}
        INCLUDES: \${{ inputs.includes }}
      with:
        github-token: \${{ inputs.token }}
        script: |
          const { BODY, FIND, REPLACE, APPEND, LOGIN, NUMBER: issue_number, INCLUDES } = process.env
          const { repo: { owner, repo } } = context
          const TITLE = BODY.split('/n')[0].trim() + '/n'
          const bodyIncludes = (c) => INCLUDES ? c.body.includes(INCLUDES) : true

          const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
            .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

          console.log(\`Looking for comment with: \${JSON.stringify({ LOGIN, TITLE, INCLUDES }, null, 2)}\`)
          console.log(\`Found comments: \${JSON.stringify(comments, null, 2)}\`)

          const comment = comments.find(c =>
            c.login === LOGIN &&
            c.body.startsWith(TITLE) &&
            bodyIncludes(c)
          )

          if (comment) {
            console.log(\`Found comment: \${JSON.stringify(comment, null, 2)}\`)
            let newBody = FIND && REPLACE ? comment.body.replace(new RegExp(FIND, 'g'), REPLACE) : BODY
            if (APPEND) {
              newBody += APPEND
            }
            await github.rest.issues.updateComment({ owner, repo, comment_id: comment.id, body: newBody })
            return comment.id
          }

          if (FIND || REPLACE || APPEND) {
            console.log('Could not find a comment to use find/replace or append to')
            return
          }

          console.log('Creating new comment')

          const res = await github.rest.issues.createComment({ owner, repo, issue_number, body: BODY })
          return res.data.id

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

.github/workflows/audit.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Audit

on:
  workflow_dispatch:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  schedule:
    # "At 09:00 UTC (01:00 PT) on Monday" https://crontab.guru/#0_9_*_*_1
    - cron: "0 9 * * 1"

jobs:
  audit:
    name: Audit Dependencies
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Audit Dependencies

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps-flags: "--package-lock"

      - name: Audit
        uses: ./.github/actions/audit

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/ci.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CI

on:
  workflow_dispatch:
    inputs:
      all:
        type: boolean
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
      all:
        type: boolean
  pull_request:
    branches:
      - main
      - latest
  push:
    branches:
      - main
      - latest
  schedule:
    # "At 10:00 UTC (02:00 PT) on Monday" https://crontab.guru/#0_10_*_*_1
    - cron: "0 10 * * 1"

jobs:
  lint:
    name: Lint
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint

      - name: Setup
        id: setup
        uses: ./.github/actions/setup

      - name: Get Changed Workspaces
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Lint
        uses: ./.github/actions/lint
        with:
          flags: \${{ steps.workspaces.outputs.flags }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

  test:
    name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: \${{ matrix.platform.os }}
    defaults:
      run:
        shell: \${{ matrix.platform.shell }}
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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Test - \${{ matrix.platform.name }} - \${{ matrix.node-version }}

      - name: Continue Matrix Run
        id: continue-matrix
        shell: bash
        run: |
          if [[ "\${{ matrix.node-version }}" == "14.17.0" || "\${{ inputs.all }}" == "true" ]]; then
            echo "result=true" >> $GITHUB_OUTPUT
          fi

      - name: Setup
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/setup
        id: setup
        with:
          node-version: \${{ matrix.node-version }}
          shell: \${{ matrix.platform.shell }}

      - name: Get Changed Workspaces
        if: steps.continue-matrix.outputs.result
        id: workspaces
        uses: ./.github/actions/changed-workspaces
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          files: \${{ (inputs.all && '--all') || '' }}

      - name: Test
        if: steps.continue-matrix.outputs.result
        uses: ./.github/actions/test
        with:
          flags: \${{ steps.workspaces.outputs.flags }}
          shell: \${{ matrix.platform.shell }}

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/codeql-analysis.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: CodeQL

on:
  workflow_dispatch:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  push:
    branches:
      - main
      - latest
  pull_request:
    branches:
      - main
      - latest
  schedule:
    # "At 11:00 UTC (03:00 PT) on Monday" https://crontab.guru/#0_11_*_*_1
    - cron: "0 11 * * 1"

jobs:
  analyze:
    name: Analyze
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    permissions:
      actions: read
      contents: read
      security-events: write
      checks: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Analyze

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/post-dependabot.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Post Dependabot

on:
  pull_request:
    branches:
      - main
      - latest
      - release/v*

jobs:
  dependency:
    name: "@npmcli/template-oss"
    permissions:
      contents: write
    outputs:
      sha: \${{ steps.sha.outputs.sha }}
    # TODO: remove head_ref check after testing
    if: github.repository_owner == 'npm' && (github.actor == 'dependabot[bot]' || contains(github.head_ref, '/npm-cli/template-oss'))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Fetch Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        continue-on-error: true
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}

      # TODO: remove step after testing
      - name: Fake Dependabot Metadata
        id: fake-metadata
        if: steps.metadata.outcome == 'failure'
        run: |
          echo "dependency-names=@npmcli/template-oss" >> $GITHUB_OUTPUT
          echo "directory=/" >> $GITHUB_OUTPUT
          echo "update-type=version-update:semver-patch" >> $GITHUB_OUTPUT

      - name: Is Dependency
        if: contains(steps.metadata.outputs.dependency-names || steps.fake-metadata.outputs.dependency-names, '@npmcli/template-oss')
        id: dependency
        run: echo "continue=true" >> $GITHUB_OUTPUT

      - name: Checkout
        if: steps.dependency.outputs.continue
        uses: actions/checkout@v3
        with:
          ref: \${{ (github.event_name == 'pull_request' && github.event.pull_request.head.ref) || '' }}

      - name: Setup
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/setup

      - name: Get Workspaces
        if: steps.dependency.outputs.continue
        uses: ./.github/actions/changed-workspaces
        id: workspaces
        with:
          files: '["\${{ steps.metadata.outputs.directory || steps.fake-metadata.outputs.directory }}"]'

      # This only sets the conventional commit prefix. This workflow can't reliably determine
      # what the breaking change is though. If a BREAKING CHANGE message is required then
      # this PR check will fail and the commit will be amended with stafftools
      - name: Apply Changes
        if: steps.workspaces.outputs.flags
        id: apply
        run: |
          npm run template-oss-apply \${{ steps.workspaces.outputs.flags }}
          if [[ \`git status --porcelain\` ]]; then
            if [[ "\${{ steps.metadata.outputs.update-type || steps.fake-metadata.outputs.update-type }}" == "version-update:semver-major" ]]; then
              prefix='feat!'
            else
              prefix='chore'
            fi
            echo "message=$prefix: postinstall for dependabot template-oss PR" >> $GITHUB_OUTPUT
          fi

      # This step will fail if template-oss has made any workflow updates. It is impossible
      # for a workflow to update other workflows. In the case it does fail, we continue
      # and then try to apply only a portion of the changes in the next step
      - name: Push All Changes
        if: steps.apply.outputs.message
        id: push
        continue-on-error: true
        run: |
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If the previous step failed, then reset the commit and remove any workflow changes
      # and attempt to commit and push again. This is helpful because we will have a commit
      # with the correct prefix that we can then --amend with @npmcli/stafftools later.
      - name: Push All Changes Except Workflows
        if: steps.apply.outputs.message && steps.push.outcome == 'failure'
        id: push-on-error
        continue-on-error: true
        run: |
          git reset HEAD~
          git checkout HEAD -- .github/workflows/
          git clean -fd .github/workflows/
          git commit -am "\${{ steps.apply.outputs.message }}"
          git push

      # If template-oss is applying breaking changes, then we fail this PR with a message saying what to do. There's no need
      # to run CI in this case because the PR will need to be fixed manually so CI will run on those commits.
      - name: Fail on Breaking Change
        if: startsWith(steps.apply.outputs.message, 'feat!')
        run: |
          TITLE="Breaking Changes"
          MESSAGE="This PR has a breaking change. Run 'npx -p @npmcli/stafftools gh template-oss-fix'"
          MESSAGE="$MESSAGE for more information on how to fix this with a BREAKING CHANGE footer."
          echo "::error title=$TITLE::$MESSAGE"
          exit 1

      - name: Get SHA
        id: sha
        run: echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

  # If everything succeeded so far then we run our normal CI workflow since GitHub actions wont rerun after a bot
  # pushes a new commit to a PR. We rerun all of CI because template-oss could affect any code in the repo including
  # lint settings and test settings.
  ci:
    name: CI
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  codeql-analysis:
    name: CodeQL
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/codeql-analysis.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

  pull-request:
    name: Pull Request
    needs: [ dependency ]
    if: needs.dependency.outputs.sha
    uses: ./.github/workflows/pull-request.yml
    with:
      ref: \${{ github.head_ref }}
      check-sha: \${{ needs.dependency.outputs.sha }}
      force: true

.github/workflows/pull-request.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Pull Request

on:
  workflow_call:
    inputs:
      ref:
        type: string
      force:
        type: boolean
      check-sha:
        type: string
  pull_request:
    branches:
      - main
      - latest
      - release/v*
    types:
      - opened
      - reopened
      - edited
      - synchronize

jobs:
  commitlint:
    name: Lint Commits
    if: github.repository_owner == 'npm' && !(!inputs.force && github.event_name == 'pull_request' && ((startsWith(github.head_ref, 'dependabot/') && contains(github.head_ref, '/npm-cli/template-oss')) || startsWith(github.head_ref, 'release/v*')))
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: \${{ inputs.ref }}

      - name: Create Check
        uses: ./.github/actions/create-check
        if: inputs.check-sha
        id: check
        with:
          sha: \${{ inputs.check-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Lint Commits

      - name: Setup
        uses: ./.github/actions/setup

      - name: Run Commitlint on Commits
        id: commit
        continue-on-error: true
        run: |
          npx --offline commitlint -V --from 'origin/\${{ github.base_ref }}' --to '\${{ github.event.pull_request.head.sha }}'

      - name: Run Commitlint on PR Title
        if: steps.commit.outcome == 'failure'
        env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          echo "$PR_TITLE" | npx --offline commitlint -V

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: steps.check.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ steps.check.outputs.check-id }}

.github/workflows/release-integration.yml
========================================
# This file is automatically added by @npmcli/template-oss. Do not edit.

name: Release Integration

on:
  workflow_call:
    inputs:
      release:
        required: true
        type: string
      releases:
        required: true
        type: string

jobs:
  check-registry:
    name: Check Registry
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup
        with:
          deps: false

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
    name: Release
    if: github.repository_owner == 'npm'
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    outputs:
      pr: \${{ steps.release.outputs.pr }}
      release: \${{ steps.release.outputs.release }}
      releases: \${{ steps.release.outputs.releases }}
      pr-branch: \${{ steps.release.outputs.pr-branch }}
      pr-number: \${{ steps.release.outputs.pr-number }}
      comment-id: \${{ steps.pr-comment.outputs.comment-id }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup

      - name: Release Please
        id: release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npx --offline template-oss-release-please "\${{ github.ref_name }}" "\${{ inputs.release-pr }}"

      # If we have opened a release PR, then immediately create an "in_progress"
      # check for it so the GitHub UI doesn't report that its mergeable.
      # This check will be swapped out for real CI checks once those are started.
      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.release.outputs.pr-sha
        id: check
        with:
          sha: \${{ steps.release.outputs.pr-sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Comment Text
        uses: actions/github-script@v6
        if: steps.release.outputs.pr-number
        id: comment-text
        env:
          PR_NUMBER: \${{ steps.release.outputs.pr-number }}
          REF_NAME: \${{ github.ref_name }}
        with:
          result-encoding: string
          script: |
            const { runId, repo: { owner, repo } } = context
            const { data: workflow } = await github.rest.actions.getWorkflowRun({ owner, repo, run_id: runId })
            let body = '## Release Manager/n/n'
            body += \`Release workflow run: \${workflow.html_url}/n/n#### Force CI to Update This Release/n/n\`
            body += \`This PR will be updated and CI will run for every non-/\`chore:/\` commit that is pushed to /\`main/\`. \`
            body += \`To force CI to update this PR, run this command:/n/n\`
            body += \`/\`/\`/\`/ngh workflow run release.yml -r \${process.env.REF_NAME} -R \${owner}/\${repo} -f release-pr=\${process.env.PR_NUMBER}/n/\`/\`/\`\`
            return body

      - name: Post Pull Request Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        id: pr-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ steps.release.outputs.pr-number }}

  update:
    name: Release PR - Update
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    if: needs.release.outputs.pr
    needs: release
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
      check-id: \${{ steps.check.outputs.check-id }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}
          fetch-depth: 0

      - name: Setup
        uses: ./.github/actions/setup

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
          echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

      - name: Create Check
        uses: ./.github/actions/create-check
        if: steps.commit.outputs.sha
        id: check
        with:
          sha: \${{ steps.vommit.outputs.sha }}
          token: \${{ secrets.GITHUB_TOKEN }}
          job-name: Release

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        if: needs.release.outputs.check-id && (success() || failure())
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ job.status }}
          check-id: \${{ needs.release.outputs.check-id }}

  ci:
    name: Release PR - CI
    needs: [ release, update ]
    if: needs.release.outputs.pr
    uses: ./.github/workflows/ci.yml
    with:
      ref: \${{ needs.release.outputs.pr-branch }}
      check-sha: \${{ needs.update.outputs.sha }}
      all: true

  post-ci:
    name: Release PR - Post CI
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, update, ci ]
    if: needs.update.outputs.check-id && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: \${{ needs.release.outputs.pr-branch }}

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="failure"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="cancelled"
          else
            result="success"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Conclude Check
        uses: ./.github/actions/conclude-check
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          conclusion: \${{ steps.needs-result.outputs.result }}
          check-id: \${{ needs.update.outputs.check-id }}

  post-release:
    name: Post Release
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: release
    if: needs.release.outputs.releases
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          RELEASES: \${{ needs.release.outputs.releases }}
        with:
          result-encoding: string
          script: |
            const releases = JSON.parse(process.env.RELEASES)
            const { runId, repo: { owner, repo } } = context
            const issue_number = releases[0].prNumber

            const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number })
              .then(comments => comments.map(c => ({ id: c.id, login: c.user.login, body: c.body })))

            console.log(\`comments: \${JSON.stringify(comments, null, 2)}\`)

            const releasePleaseComments = comments.filter(c =>
              c.login === 'github-actions[bot]' &&
              c.body.startsWith(':robot: Release is at ')
            )

            console.log(\`release please comments: \${JSON.stringify(releasePleaseComments, null, 2)}\`)

            for (const comment of releasePleaseComments) {
              await github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id })
            }

            let body = '## Release Workflow/n/n'
            for (const { pkgName, version, url } of releases) {
              body += \`- /\`\${pkgName}@\${version}/\` \${url}/n\`
            }
            body += \`- Workflow run: :arrows_counterclockwise: https://github.com/\${owner}/\${repo}/actions/runs/\${runId}\`
            return body

      - name: Create Release PR Comment
        if: steps.comment-text.outputs.result
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

  release-integration:
    name: Post Release - Integration
    needs: release
    if: needs.release.outputs.release
    uses: ./.github/workflows/release-integration.yml
    with:
      release: needs.release.outputs.release
      releases: needs.release.outputs.releases

  post-release-integration:
    name: Post Release - Post Integration
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
    needs: [ release, release-integration ]
    if: needs.release.outputs.release && (success() || failure())
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Get Needs Result
        id: needs-result
        run: |
          if [[ "\${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
            result="x"
          elif [[ "\${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
            result="heavy_multiplication_x"
          else
            result="white_check_mark"
          fi
          echo "result=$result" >> $GITHUB_OUTPUT

      - name: Comment Text
        uses: actions/github-script@v6
        id: comment-text
        env:
          PR_NUMBER: \${{ fromJSON(needs.release.outputs.release).prNumber }}
          REF_NAME: \${{ github.ref_name }}
          RESULT: \${{ steps.needs-result.outputs.result }}
        with:
          script: |
            const { RESULT, PR_NUMBER, REF_NAME } = process.env
            const tagCodeowner = RESULT !== 'white_check_mark'
            if (tagCodeowner) {
              let body = ''
              body += \`/n/n:rotating_light:\`
              body += \` @npm/cli-team: The post-release workflow failed for this release.\`
              body += \` Manual steps may need to be taken after examining the workflow output\`
              body += \` from the above workflow run. :rotating_light:\`
              body += \`/n/nTo rerun the workflow run the following command:/n/n\`
              body += \`/\`/\`/\`/ngh workflow run release.yml -r \${REF_NAME} -R \${owner}/\${repo} -f release-pr=\${PR_NUMBER}/n/\`/\`/\`\`
              return body
            }

      - name: Update Release PR Comment
        uses: ./.github/actions/upsert-comment
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          body: "## Release Workflow"
          find: "Workflow run: :[a-z_]+:"
          replace: "Workflow run :\${{ steps.needs-result.outputs.result }}:"
          append: \${{ steps.comment-text.outputs.result }}
          number: \${{ fromJson(needs.release.outputs.release).prNumber }}
          includes: \${{ github.run_id }}

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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "tap": {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
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
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  },
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
  "version": "1.0.0",
  "devDependencies": {
    "@npmcli/template-oss": "{{VERSION}}"
  }
}
`
