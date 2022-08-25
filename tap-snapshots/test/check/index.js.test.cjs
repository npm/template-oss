/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/index.js TAP check empty dir > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  .commitlintrc.js
  .github/workflows/ci.yml
  .github/ISSUE_TEMPLATE/bug.yml
  .github/ISSUE_TEMPLATE/config.yml
  .github/CODEOWNERS
  .github/dependabot.yml
  .github/matchers/tap.json
  .github/workflows/audit.yml
  .github/workflows/codeql-analysis.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release-please.yml
  .release-please-manifest.json
  release-please-config.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .eslintrc.js
  .gitignore
  .npmrc
  SECURITY.md
  CODE_OF_CONDUCT.md

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  }
  "files" is missing, expected [
    "bin/",
    "lib/"
  ]
  "scripts" is missing, expected {
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
  }
  "templateOSS" is missing, expected {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@latest tap@latest --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`

exports[`test/check/index.js TAP workspaces with empty dir > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  .commitlintrc.js
  .github/workflows/ci.yml
  .github/ISSUE_TEMPLATE/bug.yml
  .github/ISSUE_TEMPLATE/config.yml
  .github/CODEOWNERS
  .github/dependabot.yml
  .github/matchers/tap.json
  .github/workflows/audit.yml
  .github/workflows/codeql-analysis.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release-please.yml
  .release-please-manifest.json
  release-please-config.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .eslintrc.js
  .gitignore
  .npmrc
  SECURITY.md
  CODE_OF_CONDUCT.md

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  }
  "files" is missing, expected [
    "bin/",
    "lib/"
  ]
  "scripts" is missing, expected {
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
  }
  "templateOSS" is missing, expected {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@latest tap@latest --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------

The following repo files need to be added:

  .github/workflows/release-please.yml
  .release-please-manifest.json
  release-please-config.json
  .github/matchers/tap.json
  .github/workflows/ci-name-aaaa.yml

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  workspaces/a/.eslintrc.js
  workspaces/a/.gitignore

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  workspaces/a/package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  }
  "files" is missing, expected [
    "bin/",
    "lib/"
  ]
  "scripts" is missing, expected {
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
  }
  "templateOSS" is missing, expected {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@latest tap@latest --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------

The following repo files need to be added:

  .github/workflows/release-please.yml
  .release-please-manifest.json
  release-please-config.json
  .github/matchers/tap.json
  .github/workflows/ci-bbb.yml

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  workspaces/b/.eslintrc.js
  workspaces/b/.gitignore

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  workspaces/b/package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
  }
  "files" is missing, expected [
    "bin/",
    "lib/"
  ]
  "scripts" is missing, expected {
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
  }
  "templateOSS" is missing, expected {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "{{VERSION}}"
  }

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@latest tap@latest --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`
