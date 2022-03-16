const fs = require('@npmcli/fs')
const { EOL } = require('os')
const { join, relative } = require('path')

const run = async ({ root, path }) => {
  // XXX: our changelogs are always markdown
  // but they could be other extensions so
  // make this glob for possible matches
  const changelog = join(path, 'CHANGELOG.md')

  if (await fs.exists(changelog)) {
    const content = await fs.readFile(changelog, { encoding: 'utf8' })
    const mustStart = `# Changelog${EOL}${EOL}#`
    if (!content.startsWith(mustStart)) {
      return {
        title: `The ${relative(root, changelog)} is incorrect:`,
        body: [
          'The changelog should start with',
          `"${mustStart}"`,
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
