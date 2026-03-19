/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js > TAP > backport filtering > must match snapshot 1`] = `
### Release Checklist for v4.1.0

- [ ] 1. Checkout the release branch

    \`\`\`sh
    gh pr checkout 207 --force
    \`\`\`

- [ ] 2. Publish

    \`\`\`sh
    npm publish --tag=latest-10
    \`\`\`

- [ ] 3. Merge release PR

    \`\`\`sh
    gh pr merge 207 --rebase
    \`\`\`
`
