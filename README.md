## @npmcli/template-oss

This module bundles the npm CLI team's basics for package development into a
single devDependency.

**CAUTION: THESE CHANGES WILL OVERWRITE ANY LOCAL FILES AND SETTINGS**

### `package.json` patches

These fields will be set in the project's `package.json`:

```js
{
  author: 'GitHub Inc.',
  files: ['bin', 'lib'],
  license: 'ISC',
  templateVersion: $TEMPLATE_VERSION,
  scripts: {
    lint: `eslint '**/*.js'`,
    postlint: 'npm-template-check',
    lintfix: 'npm run lint -- --fix',
    preversion: 'npm test',
    postversion: 'npm publish',
    prepublishOnly: 'git push origin --follow-tags',
    snap: 'tap',
    test: 'tap',
    posttest: 'npm run lint',
  },
  engines: {
    node: '^12.13.0 || ^14.15.0 || >=16',
  },
}
```

The `"templateVersion"` field will be set to the version of this package being
installed. This is used to determine if the postinstall script should take any
action.

#### Extending

The `changes` constant located in `lib/package.js` should contain all patches
for the `package.json` file. Be sure to correctly expand any object/array based
values with the original package content.

### Static files

Any existing `.eslintrc.*` files will be removed, unless they also match the
pattern `.eslintrc.local.*`

These files will be copied, overwriting any existing files:

- `.eslintrc.js`
- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/bug.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/CODEOWNERS`
- `.gitignore`
- `LICENSE.md`
- `SECURITY.md`

#### Extending

Place files in the `lib/content/` directory, use only the file name and remove
any leading `.` characters (i.e. `.github/workflows/ci.yml` becomes `ci.yml`
and `.gitignore` becomes `gitignore`).

Modify the `content` object at the top of `lib/content/index.js` to include
your new file. The object keys are destination paths, and values are source.

### `package.json` checks

`npm-template-check` is run by `postlint` and will error if the `package.json`
is not configured properly, with steps to run to correct any problems.

#### Extending

Add any unwanted packages to `unwantedPackages` in `lib/check.js`. Currently
the best way to install any packages is to include them as `peerDependencies`
in this repo.