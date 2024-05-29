/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js > TAP > single release > must match snapshot 1`] = `
### Release Checklist for v7.5.4

- [ ] 1. Checkout the release branch and test

    \`\`\`sh
    gh pr checkout 586 --force
    npm update
    npm test
    gh pr checks 586 -R npm/node-semver --watch
    \`\`\`

- [ ] 2. Publish

    \`\`\`sh
    npm publish --tag=latest
    \`\`\`

- [ ] 3. Merge release PR

    \`\`\`sh
    gh pr merge 586 -R npm/node-semver --squash
    git checkout main
    git fetch
    git reset --hard origin/main
    \`\`\`

- [ ] 4. Check For Release Tags

    Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.

    \`\`\`sh
    gh run watch -R npm/node-semver $(gh run list -R npm/node-semver -w release -b main -L 1 --json databaseId -q ".[0].databaseId")
    \`\`\`
`
