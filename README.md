## @npmcli/template-oss

This module bundles the npm CLI team's basics for package development into a
single devDependency.

**CAUTION: THESE CHANGES WILL OVERWRITE ANY LOCAL FILES AND SETTINGS**

### `package.json` patches

These fields will be set in the project's `package.json`:

```json
{
  "author": "GitHub Inc.",
  "files": ["bin", "lib"],
  "license": "ISC",
  "scripts": {
    "lint": "eslint '**/*.js'",
    "lintfix": "npm run lint -- --fix",
    "preversion": "npm test",
    "postversion": "npm publish",
    "prepublishOnly": "git push origin --follow-tags",
    "snap": "tap",
    "test": "tap",
    "posttest": "npm run lint",
  }
}
```

### Static files

Any existing `.eslintrc.*` files will be removed, unless they also match the pattern `.eslintrc.local.*`

These files will be copied, overwriting any existing files:

- `.eslintrc.js`
- `.github/workflows/ci.yml`
- `.gitignore`
- `LICENSE.md`


### Package installation and removal

These packages will be removed:

- `eslint-plugin-import`
- `eslint-plugin-promise`
- `eslint-plugin-standard`
- `@npmcli/lint`


Afterwards, these packages will be installed as devDependencies:

- `eslint`
- `eslint-plugin-node`
- `@npmcli/eslint-config`
- `tap`
