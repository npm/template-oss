/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js > TAP > publish and lockfile > must match snapshot 1`] = `
### Release Checklist for v7.5.4

- [ ] 1. Approve this PR

    \`\`\`sh
    gh pr review 586 -R npm/node-semver --approve
    \`\`\`

- [ ] 2. Merge release PR :rotating_light: Merging this will auto publish :rotating_light:

    \`\`\`sh
    gh pr merge 586 -R npm/node-semver --squash
    \`\`\`

- [ ] 3. Check For Release Tags

    Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.

    \`\`\`sh
    gh run watch -R npm/node-semver $(gh run list -R npm/node-semver --workspace release -b main -L 1 --json databaseId -q ".[0].databaseId")
    \`\`\`
`
