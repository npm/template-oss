/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/release/release-manager.js > TAP > workspace names > promise must resolve to match snapshot 1`] = `
### Release Checklist for v10.2.2

- [ ] 1. Checkout the release branch

    Ensure git status is not dirty on this branch after resetting deps. If it is, then something is probably wrong with the automated release process.

    \`\`\`sh
    gh pr checkout 6923 --force
    \`\`\`

    \`\`\`sh
    npm run resetdeps
    \`\`\`

    \`\`\`sh
    node scripts/git-dirty.js
    \`\`\`

- [ ] 2. Check CI status

    \`\`\`sh
    gh pr checks --watch
    \`\`\`

- [ ] 3. Publish the CLI and workspaces

    > **Warning**:
    > This will publish all updated workspaces to \`latest\`, \`prerelease\` or \`backport\` depending on their version, and will publish the CLI with the dist-tag set to \`next-10\`.

    > **Note**:
    > The \`--test\` argument can optionally be omitted to run the publish process without running any tests locally.

    \`\`\`sh
    node scripts/publish.js --test
    \`\`\`

- [ ] 4. Optionally install and test \`npm@10.2.2\` locally

    \`\`\`sh
    npm i -g npm@10.2.2
    \`\`\`

    \`\`\`sh
    npm --version
    npm whoami
    npm help install
    # etc
    \`\`\`

- [ ] 5. Set \`latest\` \`dist-tag\` to newly published version

    > **Warning**:
    > NOT FOR PRERELEASE: Do not run this step for prereleases or if \`10\` is not being set to \`latest\`.

    \`\`\`sh
    node . dist-tag add npm@10.2.2 latest
    \`\`\`

- [ ] 6. Trigger \`docs.npmjs.com\` update

    \`\`\`sh
    gh workflow run update-cli.yml --repo npm/documentation
    \`\`\`

- [ ] 7. Approve and Merge release PR

    \`\`\`sh
    gh pr review --approve
    \`\`\`

    \`\`\`sh
    gh pr merge --rebase
    \`\`\`

    \`\`\`sh
    git checkout latest
    \`\`\`

    \`\`\`sh
    git fetch
    \`\`\`

    \`\`\`sh
    git reset --hard origin/latest
    \`\`\`

    \`\`\`sh
    node . run resetdeps
    \`\`\`

- [ ] 8. Wait For Release Tags

    > **Warning**:
    > The remaining steps all require the GitHub tags and releases to be created first. These are done once this PR has been labelled with \`autorelease: tagged\`.

    Release Please will run on the just merged release commit and create GitHub releases and tags for each package. The release bot will will comment on this PR when the releases and tags are created.

    > **Note**:
    > The release workflow also includes the Node integration tests which do not need to finish before continuing.

    You can watch the release workflow in your terminal with the following command:

    \`\`\`
    gh run watch \`gh run list -R npm/cli -w release -b latest -L 1 --json databaseId -q ".[0].databaseId"\`
    \`\`\`

- [ ] 9. Mark GitHub Release as \`latest\`

    > **Warning**:
    > You must wait for CI to create the release tags before running this step. These are done once this PR has been labelled with \`autorelease: tagged\`.

    Release Please will make GitHub Releases for the CLI and all workspaces, but GitHub has UI affordances for which release should appear as the "latest", which should always be the CLI. To mark the CLI release as latest run this command:

    \`\`\`sh
    gh release -R npm/cli edit v10.2.2 --latest
    \`\`\`

- [ ] 10. Open \`nodejs/node\` PR to update \`npm\` to latest

    > **Warning**:
    > You must wait for CI to create the release tags before running this step. These are done once this PR has been labelled with \`autorelease: tagged\`.

    Trigger the [**Create Node PR** action](https://github.com/npm/cli/actions/workflows/create-node-pr.yml). This will open a PR on \`nodejs/node\` to the \`main\` branch.

    > **Note**:
    > The resulting PR *may* need to be labelled if it is not intended to land on old Node versions.

    First, sync our fork of node with the upstream source:

    \`\`\`sh
    gh repo sync npm/node --source nodejs/node --force
    \`\`\`

    Then, if we are opening a PR against the latest version of node:

    \`\`\`sh
    gh workflow run create-node-pr.yml -f spec=next-10
    \`\`\`

    If the PR should be opened on a different branch (such as when doing backports) then run it with \`-f branch=<BRANCH_NAME>\`. There is also a shortcut to target a specific Node version by specifying a major version number with \`-f branch=18\` (or similar).

    For example, this will create a PR on nodejs/node to the \`v16.x-staging\` branch:

    \`\`\`sh
    gh workflow run create-node-pr.yml -f spec=next-10 -f branch=16
    \`\`\`

- [ ] 11. Label and fast-track \`nodejs/node\` PR

    > **Note**:
    > This requires being a \`nodejs\` collaborator. This could be you! 

    - Thumbs-up reaction on the Fast-track comment
    - Add an LGTM / Approval
    - Add \`request-ci\` label to get it running CI
    - Add \`commit-queue\` label once everything is green
`
