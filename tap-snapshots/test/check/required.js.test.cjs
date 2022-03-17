/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/check/required.js TAP not ok without required > expect resolving Promise 1`] = `
Some problems were detected:

-------------------------------------------------------------------

The following required devDependencies were not found:

  @npmcli/template-oss@{{VERSION}}
  @npmcli/eslint-config
  tap

To correct it: npm rm @npmcli/template-oss @npmcli/eslint-config tap && npm i @npmcli/eslint-config@latest tap@latest --save-dev && npm i @npmcli/template-oss@{{VERSION}} --save-dev --save-exact

-------------------------------------------------------------------
`
