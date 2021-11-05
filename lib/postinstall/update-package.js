const PackageJson = require('@npmcli/package-json')

const {
  version: TEMPLATE_VERSION,
  name: TEMPLATE_NAME,
} = require('../../package.json')

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
  engines: {
    node: '^12.13.0 || ^14.15.0 || >=16',
  },
}

const patchPackage = async (root) => {
  const pkg = await PackageJson.load(root)

  // If we are running this on itself, we always run the script.
  // We also don't set templateVersion in package.json because
  // its not relavent and would cause git churn after running
  // `npm version`.
  const isDogfood = pkg.content.name === TEMPLATE_NAME

  // if the target package.json has a templateVersion field matching our own
  // current version, we return false here so the postinstall script knows to
  // exit early instead of running everything again
  if (pkg.content.templateVersion === TEMPLATE_VERSION && !isDogfood) {
    return false
  }

  // we build a new object here so our exported set of changes is not modified
  const update = {
    ...changes,
    scripts: {
      ...pkg.content.scripts,
      ...changes.scripts,
    },
  }

  if (isDogfood) {
    delete update.templateVersion
  }

  pkg.update(update)

  await pkg.save()
  return true
}

patchPackage.changes = changes

module.exports = patchPackage
