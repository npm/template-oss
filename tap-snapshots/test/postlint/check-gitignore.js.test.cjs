/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/postlint/check-gitignore.js TAP no warnings > must match snapshot 1`] = `
Array []
`

exports[`test/postlint/check-gitignore.js TAP will report tracked files in gitignore > must match snapshot 1`] = `
Array [
  Object {
    "message": String(
      The following files are tracked by git but matching a pattern in .gitignore:
        willIgnore1
        willIgnore2
    ),
    "solution": String(
      Move files to not match one of these patterns:
        ignored
        willIgnore*
    ),
  },
]
`
