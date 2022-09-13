/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/diffs.js TAP different headers > initial check 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  header.txt
  noheader.txt
  nocomment.txt

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diffs.js TAP different headers > source after apply 1`] = `
content/index.js
========================================
module.exports = {
  rootRepo: {
    add: {
      'header.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          static header = 'Different header'
        },
      },
      'noheader.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          static header = null
        },
      },
      'nocomment.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          comment = null
        },
      },
    },
  },
}

content/source.txt
========================================
source

header.txt
========================================
Different header

source

nocomment.txt
========================================
source

noheader.txt
========================================
source

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "templateOSS": {
    "version": "{{VERSION}}"
  }
}
`

exports[`test/check/diffs.js TAP json delete > initial check 1`] = `
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

exports[`test/check/diffs.js TAP json delete > source after apply 1`] = `
content/index.js
========================================
module.exports = {
  rootRepo: {
    add: {
      'target.json': {
        file: 'source.json',
        parser: (p) => p.Json,
      },
    },
  },
}

content/source.json
========================================
{"a":"__DELETE__","b":2}

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "templateOSS": {
    "version": "{{VERSION}}"
  }
}

target.json
========================================
{
  "//@npmcli/template-oss": "This file is automatically added by @npmcli/template-oss. Do not edit.",
  "b": 2
}
`

exports[`test/check/diffs.js TAP json merge > initial check 1`] = `
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

exports[`test/check/diffs.js TAP json merge > source after apply 1`] = `
content/index.js
========================================
module.exports = {
  rootRepo: {
    add: {
      'target.json': {
        file: 'source.json',
        parser: (p) => p.JsonMerge,
      },
    },
  },
}

content/source.json
========================================
{"b":1}

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "templateOSS": {
    "version": "{{VERSION}}"
  }
}

target.json
========================================
{
  "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
  "a": 1,
  "b": 1
}
`

exports[`test/check/diffs.js TAP json overwrite > initial check 1`] = `
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

exports[`test/check/diffs.js TAP json overwrite > source after apply 1`] = `
content/index.js
========================================
module.exports={rootRepo:{add:{'target.json':'source.json'}}}

content/source.json
========================================
{"b":1}

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "templateOSS": {
    "version": "{{VERSION}}"
  }
}

target.json
========================================
{
  "//@npmcli/template-oss": "This file is automatically added by @npmcli/template-oss. Do not edit.",
  "b": 1
}
`

exports[`test/check/diffs.js TAP node 10 > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file ci.yml needs to be updated:

  .github/workflows/ci.yml
  ========================================
  @@ -37,8 +37,9 @@
       strategy:
         fail-fast: false
         matrix:
           node-version:
  +          - 10
             - 14.17.0
             - 14.x
             - 16.13.0
             - 16.x

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The repo file release-test.yml needs to be updated:

  .github/workflows/release-test.yml
  ========================================
  @@ -33,8 +33,9 @@
       strategy:
         fail-fast: false
         matrix:
           node-version:
  +          - 10
             - 14.17.0
             - 14.x
             - 16.13.0
             - 16.x

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "engines.node" is "^14.17.0 || ^16.13.0 || >=18.0.0", expected "^10.0.0 || ^14.17.0 || ^16.13.0 || >=18.0.0"

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diffs.js TAP unknown file type > initial check 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  target.txt

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diffs.js TAP unknown file type > source after apply 1`] = `
content/index.js
========================================
module.exports={rootRepo:{add:{'target.txt':'source.txt'}}}

content/source.txt
========================================
source

package.json
========================================
{
  "name": "testpkg",
  "version": "1.0.0",
  "templateOSS": {
    "version": "{{VERSION}}"
  }
}

target.txt
========================================
This file is automatically added by @npmcli/template-oss. Do not edit.

source
`

exports[`test/check/diffs.js TAP update, remove, errors > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The repo file ci.yml needs to be updated:

  .github/workflows/ci.yml
  ========================================
  @@ -65,4 +65,24 @@
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

The following module files need to be deleted:

  .eslintrc.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .npmrc

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`

exports[`test/check/diffs.js TAP will diff json > expect resolving Promise 1`] = `
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

exports[`test/check/diffs.js TAP workspaces > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following module files need to be deleted:

  workspaces/a/.npmrc

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be deleted:

  workspaces/b/.npmrc

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------
`
