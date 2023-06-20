/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/snapshots.js TAP changelog > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The CHANGELOG.md is incorrect:

  The changelog should start with
  "# Changelog
  
  #"

To correct it: reformat the changelog to have the correct heading

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP check empty dir > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  .commitlintrc.js
  .github/CODEOWNERS
  .github/dependabot.yml
  .github/ISSUE_TEMPLATE/bug.yml
  .github/ISSUE_TEMPLATE/config.yml
  .github/matchers/tap.json
  .github/settings.yml
  .github/workflows/audit.yml
  .github/workflows/ci-release.yml
  .github/workflows/ci.yml
  .github/workflows/codeql-analysis.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release.yml
  .release-please-manifest.json
  release-please-config.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .eslintrc.js
  .gitignore
  .npmrc
  CODE_OF_CONDUCT.md
  CONTRIBUTING.md
  SECURITY.md

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^14.17 || ^16.13 || >=18"
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
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  }
  "tap" is missing, expected {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@* tap@* --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP gitignore > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in .gitignore:

  ignorethis
  package-lock.json

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP gitignore with workspaces workspace > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in .gitignore:

  ignorethis

To correct it: move files to not match one of the following patterns:

  /*
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
  !/workspaces/
  /workspaces/*
  !/workspaces/a/
  !/workspaces/b/

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspaces/a/.gitignore:

  workspaces/a/wsafile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspaces/b/.gitignore:

  workspaces/b/wsbfile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP not ok without required > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@* tap@* --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP unwanted > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following unwanted packages were found:

  eslint

To correct it: npm rm eslint

-------------------------------------------------------------------
`

exports[`test/check/snapshots.js TAP workspaces with empty dir > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following repo files need to be added:

  .commitlintrc.js
  .github/CODEOWNERS
  .github/dependabot.yml
  .github/ISSUE_TEMPLATE/bug.yml
  .github/ISSUE_TEMPLATE/config.yml
  .github/matchers/tap.json
  .github/settings.yml
  .github/workflows/audit.yml
  .github/workflows/ci-release.yml
  .github/workflows/ci.yml
  .github/workflows/codeql-analysis.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release.yml
  .release-please-manifest.json
  release-please-config.json

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The following module files need to be added:

  .eslintrc.js
  .gitignore
  .npmrc
  CODE_OF_CONDUCT.md
  CONTRIBUTING.md
  SECURITY.md

To correct it: npx template-oss-apply --force

-------------------------------------------------------------------

The module file package.json needs to be updated:

  package.json
  ========================================
  "author" is missing, expected "GitHub Inc."
  "engines" is missing, expected {
    "node": "^14.17 || ^16.13 || >=18"
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
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint",
    "test-all": "npm run test -ws -iwr --if-present",
    "lint-all": "npm run lint -ws -iwr --if-present"
  }
  "tap" is missing, expected {
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

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@* tap@* --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------

The following repo files need to be added:

  .github/dependabot.yml
  .github/matchers/tap.json
  .github/settings.yml
  .github/workflows/ci-name-aaaa.yml
  .github/workflows/ci-release.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release.yml
  .release-please-manifest.json
  release-please-config.json

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
    "node": "^14.17 || ^16.13 || >=18"
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
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  }
  "tap" is missing, expected {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@* tap@* --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------

The following repo files need to be added:

  .github/dependabot.yml
  .github/matchers/tap.json
  .github/settings.yml
  .github/workflows/ci-bbb.yml
  .github/workflows/ci-release.yml
  .github/workflows/post-dependabot.yml
  .github/workflows/pull-request.yml
  .github/workflows/release.yml
  .release-please-manifest.json
  release-please-config.json

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
    "node": "^14.17 || ^16.13 || >=18"
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
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint"
  }
  "tap" is missing, expected {
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
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

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@* tap@* --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`
