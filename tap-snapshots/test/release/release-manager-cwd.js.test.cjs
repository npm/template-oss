/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js TAP cwd > expect resolving Promise 1`] = `
### Release Checklist for v10.2.5

- [ ] 1. Checkout the release branch and test

    \`\`\` sh
    gh pr checkout 7009 --force
    npm update
    npm test
    gh pr checks 7009 -R npm/cli --watch
    \`\`\`

- [ ] 2. Publish

    \`\`\` sh
    npm publish --tag=latest
    \`\`\`

- [ ] 3. Merge release PR

    \`\`\` sh
    gh pr merge 7009 -R npm/cli --rebase
    git checkout latest
    git fetch
    git reset --hard origin/latest
    \`\`\`

- [ ] 4. Check For Release Tags

    Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.

    \`\`\`
    gh run watch -R npm/cli $(gh run list -R npm/cli -w release -b latest -L 1 --json databaseId -q ".[0].databaseId")
    \`\`\`
`
