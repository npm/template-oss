const fs = require('fs/promises')
const { existsSync } = require('fs')
const { join, relative } = require('path')

const run = async ({ root, path }) => {
  // XXX: our changelogs are always markdown
  // but they could be other extensions so
  // make this glob for possible matches
  const changelog = join(path, 'CHANGELOG.md')

  if (existsSync(changelog)) {
    const content = await fs.readFile(changelog, { encoding: 'utf8' })
    const mustStart = /^#\s+Changelog\r?\n\r?\n#/
    if (!mustStart.test(content)) {
      return {
        title: `The ${relative(root, changelog)} is incorrect:`,
        body: [
          'The changelog should start with',
          `"# Changelog\n\n#"`,
        ],
        solution: 'reformat the changelog to have the correct heading',
      }
    }
  }
}

module.exports = {
  run,
  when: ({ config: c }) => c.applyModule,
  name: 'check-changelog',
}
