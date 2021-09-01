const PackageJson = require('@npmcli/package-json')

const TEMPLATE_VERSION = require('../package.json').version

const changes = {
  author: 'GitHub Inc.',
  files: ['bin', 'lib'],
  license: 'ISC',
  templateVersion: TEMPLATE_VERSION,
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
}

const patchPackage = async (root) => {
  const pkg = await PackageJson.load(root)

  // if the target package.json has a templateVersion field matching our own
  // current version, we return false here so the postinstall script knows to
  // exit early instead of running everything again
  if (pkg.content.templateVersion === TEMPLATE_VERSION) {
    return false
  }

  // we build a new object here so our exported set of changes is not modified
  pkg.update({
    ...changes,
    scripts: {
      ...pkg.content.scripts,
      ...changes.scripts,
    },
  })

  await pkg.save()
  return true
}
patchPackage.changes = changes

module.exports = patchPackage
