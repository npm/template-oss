const PackageJson = require('@npmcli/package-json')

const changes = {
  author: 'GitHub Inc.',
  files: ['bin', 'lib'],
  license: 'ISC',
  scripts: {
    lint: `eslint '**/*.js'`,
    lintfix: 'npm run lint -- --fix',
    preversion: 'npm test',
    postversion: 'npm publish',
    prepublishOnly: 'git push origin --follow-tags',
    snap: 'tap',
    test: 'tap',
    posttest: 'npm run lint',
  },
}

const patchPackage = async (root) => {
  const pkg = await PackageJson.load(root)

  pkg.update(changes)

  return pkg.save()
}
patchPackage.changes = changes

module.exports = patchPackage
