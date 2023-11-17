/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/diff-snapshots.js TAP different headers > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  header.txt
  nocomment.txt
  noheader.txt

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP json delete > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file target.json needs to be updated:

  target.json
  ========================================
  "//@npmcli/template-oss" is missing, expected "This file is automatically added by @npmcli/template-oss. Do not edit."
  "a" is 1, expected to be removed
  "b" is missing, expected 2

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP json merge > initial check 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file target.json needs to be updated:

  target.json
  ========================================
  "//@npmcli/template-oss" is missing, expected "This file is partially managed by @npmcli/template-oss. Edits may be overwritten."
  "b" is missing, expected 1

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP json overwrite > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file target.json needs to be updated:

  target.json
  ========================================
  "//@npmcli/template-oss" is missing, expected "This file is automatically added by @npmcli/template-oss. Do not edit."
  "b" is missing, expected 1

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP unknown file type > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  target.txt

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP update and remove errors > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file audit.yml needs to be updated:

  .github/workflows/audit.yml
  ========================================
  [@npmcli/template-oss ERROR] There was an erroring getting the target file
  [@npmcli/template-oss ERROR] Error: {{ROOT}}/test/check/tap-testdir-diff-snapshots-update-and-remove-errors/.github/workflows/audit.yml
  
  YAMLParseError: Implicit keys need to be on a single line at line 42, column 1:
  
          run: npm audit --audit-level=none
  >>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<
  ^
  
  YAMLParseError: Block scalar header includes extra characters: >>>>I at line 42, column 2:
  
  >>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<
   ^
  
  YAMLParseError: Not a YAML token: HOPE THIS IS NOT VALID YAML<<<<<<<<<<< at line 42, column 7:
  
  >>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  
  YAMLParseError: Implicit map keys need to be followed by map values at line 42, column 1:
  
          run: npm audit --audit-level=none
  >>>>I HOPE THIS IS NOT VALID YAML<<<<<<<<<<<
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  
  Document with errors cannot be stringified
  [@npmcli/template-oss ERROR] It will be overwritten with the following source:
  ----------------------------------------
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
          id: node
          with:
            node-version: 20.x
            check-latest: contains('20.x', '.x')
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
  

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The repo file ci.yml needs to be updated:

  .github/workflows/ci.yml
  ========================================
  @@ -76,4 +76,24 @@
           shell: \${{ matrix.platform.shell }}
       steps:
         - name: Checkout
           uses: actions/checkout@v3
  +      - name: Setup Git User
  +        run: |
  +          git config --global user.email "npm-cli+bot@github.com"
  +          git config --global user.name "npm CLI robot"
  +      - name: Setup Node
  +        uses: actions/setup-node@v3
  +        id: node
  +        with:
  +          node-version: \${{ matrix.node-version }}
  +          check-latest: contains(matrix.node-version, '.x')
  +      - name: Install Latest npm
  +        uses: ./.github/actions/install-latest-npm
  +        with:
  +          node: \${{ steps.node.outputs.node-version }}
  +      - name: Install Dependencies
  +        run: npm i --ignore-scripts --no-audit --no-fund
  +      - name: Add Problem Matcher
  +        run: echo "::add-matcher::.github/matchers/tap.json"
  +      - name: Test
  +        run: npm test --ignore-scripts

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be deleted:

  .eslintrc.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .npmrc

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diff-snapshots.js TAP will diff json > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "author" is "heynow", expected "GitHub Inc."
  "files[1]" is "x", expected "lib/"
  "scripts.lint:fix" is "x", expected to be removed
  "scripts.preversion" is "x", expected to be removed
  "standard" is {
    "config": "x "
  }, expected to be removed
  "templateVersion" is "1", expected to be removed

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`
