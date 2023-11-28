/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js TAP mock release manager > must match snapshot 1`] = `
### Release Checklist for v4.0.5

- [ ] 1. Checkout the release branch and test

    \`\`\`sh
    gh pr checkout 207 --force
    npm update
    npm test
    gh pr checks 207 -R npm/npm-cli-release-please --watch
    \`\`\`

- [ ] 2. Publish workspaces

    \`\`\`sh
    npm publish --tag=latest
    npm publish --tag=latest
    npm publish --tag=latest
    \`\`\`

- [ ] 3. Publish

    \`\`\`sh
    npm publish --tag=latest
    \`\`\`

- [ ] 4. Merge release PR

    \`\`\`sh
    gh pr merge 207 -R npm/npm-cli-release-please --squash
    git checkout main
    git fetch
    git reset --hard origin/main
    \`\`\`

- [ ] 5. Check For Release Tags

    Release Please will run on the just pushed release commit and create GitHub releases and tags for each package.

    \`\`\`sh
    gh run watch -R npm/npm-cli-release-please $(gh run list -R npm/npm-cli-release-please -w release -b main -L 1 --json databaseId -q ".[0].databaseId")
    \`\`\`
`
