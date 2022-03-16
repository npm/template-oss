## @npmcli/template-oss

This module bundles the npm CLI team's basics for package development into a
single devDependency.

**CAUTION: THESE CHANGES WILL OVERWRITE ANY LOCAL FILES AND SETTINGS**

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

### Content

All the templated content for this repo lives in
[`lib/content/`](./lib/content/). The `index.js`[./lib/content/index.js] file
controls how and where this content is written.

Content files can be overwritten or merged with the existing target file.
Currently mergining is only supported for `package.json` files.

Each content file goes through the following pipeline:

1. It is read from its source location
1. It is are templated using Handlebars with the variables from each packages's
   config (with some derived values generated in [`config.js`](./lib/config.js)
1. It is parsed based on its file extension in
   [`parser.js`](./lib/util/parser.js)
1. Additional logic is applied by the parser
1. It is written to its target location

### Usage

This package provides two bin scripts:

#### `template-oss-check`

This will check if any of the applied files different from the target content,
or if any of the other associated checks fail. The diffs of each file or check
will be reported with instructions on how to fix it.

#### `template-oss-apply [--force]`

This will write all source files to their target locations in the cwd. It will
do nothing if `package.json#templateOSS.version` is the same as the version
being run. This can be overridden by `--force`.

This is the script that is run on `postinsall`.

### Extending

#### `lib/apply`

This directory is where all the logic for applying files lives. It should be
possible to add new files without modifying anything in this directory. To add a
file, add the templated file to `lib/content/$FILENAME` and add entry for it in
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
