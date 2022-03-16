/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/gitignore.js TAP will report tracked files in gitignore > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in .gitignore:

  ignorethis

To correct it: move files to not match one of the following patterns:

  /*
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
  !/SECURITY.md
  !/bin/
  !/lib/
  !/package.json

-------------------------------------------------------------------
`

exports[`test/check/gitignore.js TAP will report tracked files in gitignore workspace > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in .gitignore:

  ignorethis

To correct it: move files to not match one of the following patterns:

  /*
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
  !/SECURITY.md
  !/bin/
  !/lib/
  !/package.json
  !/workspaces/

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspaces/a/.gitignore:

  workspaces/a/wsafile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspaces/b/.gitignore:

  workspaces/b/wsbfile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------
`

exports[`test/check/gitignore.js TAP works with workspaces in separate dirs > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in .gitignore:

  ignorethis

To correct it: move files to not match one of the following patterns:

  /*
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
  !/SECURITY.md
  !/bin/
  !/lib/
  !/package.json
  !/workspace-a
  !/workspace-b

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspace-a/.gitignore:

  workspace-a/wsafile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------

The following files are tracked by git but matching a pattern in workspace-b/.gitignore:

  workspace-b/wsbfile

To correct it: move files to not match one of the following patterns:

  /*
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

-------------------------------------------------------------------
`
