## @npmcli/template-oss

This module bundles the npm CLI team's basics for package development into a
single devDependency.

> [!WARNING]  
> THESE CHANGES WILL OVERWRITE LOCAL FILES AND SETTINGS

> [!IMPORTANT]  
> This package does not follow semantic versioning for its API. This package is designed to be installed with `--save-exact` and therefore will make breaking API changes outside of major versions, including `engines` narrowing. Major versions are reserved for breaking changes to files written to a repo by this package.

### Configuration

Configure the use of `@npmcli/template-oss` in your `package.json` using the
`templateOSS` property.


```js
{
  name: 'my-package',
  templateOSS: {
    // copy repo specific files for the root pkg
    rootRepo: true,
    // modify package.json and copy module specific files for the root pkg
    rootModule: true,
    // copy repo files for all workspaces
    workspaceRepo: true,
    // copy module files for all workspaces
    workspaceModule: true,
    // filter allowed workspaces by package name
    // defaults to all workspaces
    workspaces: ['workspace-package-name'],
    // The rest of the config is passed in as variables
    // that can be used to template files in the content
    // directory. Some common ones are:
    // Turns off ci in windows
    windowsCI: false,
    // Change the versions tested in CI and engines
    ciVersions: ['10', '12', '14']
  }
}
```

#### Workspaces

Individual workspaces can also supply their own config, if they are included by
the root package's `templateOSS.workspaces` array. These settings will override
any of the same settings in the root.

```js
{
  name: 'my-workspace',
  templateOSS: {
    // copy repo files for this workspace
    workspaceRepo: true,
    // copy module files for this workspace
    moduleRepo: true,
    // Changes windowsCI setting for this workspace
    windowsCI: false,
  }
}
```

#### Backport PR automation

Backport automation is disabled by default.
To enable it, set this option in the **root** `package.json` and run `template-oss-apply --force`:

```json
{
  "templateOSS": {
    "backportAutomation": true
  }
}
```

With `rootRepo` enabled, this manages `.github/workflows/backport.yml` and `.github/scripts/backport.cjs`.
The helper needs no installed dependencies and works in both CommonJS and ESM repositories.
Workspace configuration alone does not enable it.
This option is independent of the existing numeric `backport` release/publishing setting and does not change release behavior.

Before using it:

- Apply the generated files to the repository's default branch.
  The privileged `pull_request_target` workflow only executes the helper from that trusted branch, never from a PR head.
  It does not install dependencies or run project build scripts.
- Create each target release branch in advance.
  A label `backport:X` selects `release/X`: for example, `backport:v5` targets `release/v5`.
  Targets are literal branch names, not the configurable release-branch pattern.
  Label suffixes must start with an ASCII letter or digit and otherwise contain only letters, digits, `.`, `_`, `/`, or `-`, and must form valid Git branch names.
- Provide a root `.github/workflows/ci.yml` supporting `workflow_dispatch`, both on the default branch and on release branches.
  Template-oss's root CI already uses this convention.
  The workflow explicitly dispatches it on each backport branch, without custom inputs.
- Enable **Allow GitHub Actions to create and approve pull requests** in the repository's Actions settings (subject to organization policy).
  The backport job requests only `contents: write`, `pull-requests: write`, and `actions: write`.
  Branch rules and repository policies must allow creation of `backport/*` branches and PRs using `GITHUB_TOKEN`.

The workflow runs when a labeled PR merges or a `backport:` label is added to an already-merged PR.
It reads all current backport labels on each run, so multiple targets and coalesced label events are handled together.
For PR `123` and label `backport:v5`, it cherry-picks to `backport/v5/123`, opens a PR against `release/v5`, and dispatches CI.
It never creates or modifies release branches, force-pushes, or automatically merges PRs.

GitHub.com's current [`GITHUB_TOKEN` behavior](https://docs.github.com/en/actions/concepts/security/github_token) allows bot-created/updated PRs to trigger `opened`, `synchronize`, and `reopened` PR workflow runs in an **approval-required** state.
A writer can select **Approve workflows to run** on the PR.
The explicit `workflow_dispatch` is an exception to token event suppression and provides CI without relying on those PR runs; it does not approve or replace other required checks.
A rerun may dispatch CI again.

Reruns reuse open backport PRs and verify existing branches before recovering a failed PR creation or retrying CI.
Already-merged backport PRs are left alone; closed, unmerged PRs must be reopened manually.
Unexpected or manually edited backport branches require inspection instead of being overwritten.
Disabling the option stops managing these files; remove previously generated files explicitly if automation should stop.

Failures appear in the Actions job summary and fail the run without preventing other targets from being attempted.
Fix permission/API problems or missing targets and rerun the job.
For conflicts, create a manual backport from the release branch, cherry-pick the original merged change, resolve conflicts, and open a PR using a different branch name.
Do not expect this workflow to resolve conflicts or overwrite manual resolutions.

Merge commits use their first parent; squash merges use the whole squashed change; rebase merges preserve the complete verified commit series.
Squash and rebase detection compares patches rather than commit subjects.
Ambiguous or changed patches, empty/already-applied changes, and single-parent merges whose PR commit list exceeds GitHub's 250-commit API limit require manual backporting rather than risking omitted commits.
Changes to workflow files can also be rejected by `GITHUB_TOKEN` permissions and require a manual backport.

### Content

All the templated content for this repo lives in
[`lib/content/`](./lib/content/). The [`index.js`](./lib/content/index.js) file
controls how and where this content is written.

Content files can be overwritten or merged with the existing target file.
Merging is only supported for some types of files (ini, yaml, json, package.json)

Each content file goes through the following pipeline:

1. It is read from its source location
2. It is compiled using [Handlebars](https://handlebarsjs.com/) with the variables from each packages's
   config (with some derived values generated in [`config.js`](./lib/config.js))
3. It is parsed based on its file extension in
   [`parser.js`](./lib/util/parser.js)
4. Additional logic is applied by the parser
5. It is written to its target location

### Usage

This package provides two bin scripts:

#### `template-oss-check`

This will check if any of the applied files differ from the target content,
or if any of the other associated checks fail. The diffs of each file or check
will be reported with instructions on how to fix it.

#### `template-oss-apply [--force]`

This will write all source files to their target locations in the cwd. It will
do nothing if `package.json#templateOSS.version` is the same as the version
being run. This can be overridden by `--force`.

This is the script that is run on `postinstall`.

### Extending

#### `lib/apply`

This directory is where all the logic for applying files lives. It should be
possible to add new files without modifying anything in this directory. To add a
file, add the templated file to `lib/content/$FILENAME` and an entry for it in
`lib/content/index.js` depending on where and when it should be written (root vs
workspace, repo vs module, add vs remove, etc).

#### `lib/check`

All checks live in this directory and have the same signature. A check must be
added to `lib/check/index.js` for it to be run.

#### Generic vs specific extensions

This repo is designed so that all (fine, most) of the logic in `lib/` is generic
and could be applied across projects of many different types.

The files in `lib/content` are extremely specific to the npm CLI. It would be
trivial to swap out this content directory for a different one as it is only
referenced in a single place in `lib/config.js`. However, it's not currently
possible to change this value at runtime, but that might become possible in
future versions of this package.

### Testing

The files `test/release/release-manager.js` and `test/release/release-please.js`
use recorded `nock` fixtures to generate snapshots. To update these fixtures run:

```sh
GITHUB_TOKEN=$(gh auth token) npm run test:record --- test/release/release-{please,manager}.js
```

If you only need to update fixtures for one, it's best to only run that single
test file.

#### `test/release/release-please.js`

This test file uses the repo `npm/npm-cli-release-please` to record its
fixtures. It expects `https://github.com/npm/npm-cli-release-please` to be
checked out in a sibling directory to this repo. It also needs the current
branch set to `template-oss-mock-testing-branch-do-not-delete` before the tests
are run.
