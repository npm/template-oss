const PackageJson = require('@npmcli/package-json')
const { set, unset, get } = require('lodash')
const { configKey } = require('../constants')

const path = `content.${configKey}.version`

const apply = async ({ pkg, options }) => {
  const { path: dir } = pkg
  const { version, isDogFood } = options

  const pkgJson = await PackageJson.load(dir)

  /* istanbul ignore next */
  if (isDogFood) {
    // always ignore our own version for this repo
    unset(pkgJson, path)
  } else {
    set(pkgJson, path, version)
  }

  await pkgJson.save()
}

const check = async ({ pkg, options }) => {
  const { path: dir } = pkg
  const { version } = options

  const pkgJson = await PackageJson.load(dir)

  if (get(pkgJson, path) !== version) {
    return {
      title: `package.json \`${path.replace('content.', '')}\` should be ${version}`,
      solution: 'npx template-oss-apply --force',
    }
  }
}

module.exports = {
  name: 'version',
  apply: {
    run: apply,
    when: ({ options }) => options.needsUpdate,
  },
  check: {
    run: check,
    when: ({ options }) => !options.isDogFood,
  },
}
