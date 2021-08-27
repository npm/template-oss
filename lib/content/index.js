const { dirname, join } = require('path')
const fs = require('@npmcli/fs')

// keys are destination paths in the target project
// values are paths to contents relative to this file
const content = {
  '.eslintrc.js': './eslintrc.js',
  '.github/workflows/ci.yml': './ci.yml',
  '.gitignore': './gitignore',
  'LICENSE.md': './LICENSE.md',
}

// given a root directory, copy all files in the content map
// after purging any non-local .eslintrc config files
const copyContent = async (root) => {
  const contents = await fs.readdir(root)

  for (const file of contents) {
    // remove any eslint config files that aren't local to the project
    if (file.startsWith('.eslintrc.') && !file.startsWith('.eslintrc.local.')) {
      await fs.rm(join(root, file))
    }
  }

  for (let [target, source] of Object.entries(content)) {
    source = join(__dirname, source)
    target = join(root, target)
    // if the target is a subdirectory of the root, mkdirp it first
    if (dirname(target) !== root) {
      await fs.mkdir(dirname(target), {
        owner: 'inherit',
        recursive: true,
        force: true,
      })
    }
    await fs.copyFile(source, target, { owner: 'inherit' })
  }
}
copyContent.content = content

module.exports = copyContent
