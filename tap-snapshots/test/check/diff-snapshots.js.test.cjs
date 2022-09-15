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
  [@npmcli/template-oss ERROR] Error: Document with errors cannot be stringified
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
      if: github.repository_owner == 'npm'
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Setup git user
          run: |
            git config --global user.email "npm-cli+bot@github.com"
            git config --global user.name "npm CLI robot"
        - uses: actions/setup-node@v3
          with:
            node-version: 18.x
        - name: Update npm to latest
          run: npm i --prefer-online --no-fund --no-audit -g npm@latest
        - run: npm -v
        - run: npm i --ignore-scripts --no-audit --no-fund --package-lock
        - run: npm audit
  

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The repo file ci.yml needs to be updated:

  .github/workflows/ci.yml
  ========================================
  @@ -67,4 +67,24 @@
           with:
             node-version: \${{ matrix.node-version }}
         - name: Update to workable npm (windows)
           # node 12 and 14 ship with npm@6, which is known to fail when updating itself in windows
  +        if: matrix.platform.os == 'windows-latest' && (startsWith(matrix.node-version, '12.') || startsWith(matrix.node-version, '14.'))
  +        run: |
  +          curl -sO https://registry.npmjs.org/npm/-/npm-7.5.4.tgz
  +          tar xf npm-7.5.4.tgz
  +          cd package
  +          node lib/npm.js install --no-fund --no-audit -g ../npm-7.5.4.tgz
  +          cd ..
  +          rmdir /s /q package
  +      - name: Update npm to 7
  +        # If we do test on npm 10 it needs npm7
  +        if: startsWith(matrix.node-version, '10.')
  +        run: npm i --prefer-online --no-fund --no-audit -g npm@7
  +      - name: Update npm to latest
  +        if: \${{ !startsWith(matrix.node-version, '10.') }}
  +        run: npm i --prefer-online --no-fund --no-audit -g npm@latest
  +      - run: npm -v
  +      - run: npm i --ignore-scripts --no-audit --no-fund
  +      - name: add tap problem matcher
  +        run: echo "::add-matcher::.github/matchers/tap.json"
  +      - run: npm test --ignore-scripts

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
