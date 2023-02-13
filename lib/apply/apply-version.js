const log = require('proc-log')
const PackageJson = require('@npmcli/package-json')

const run = async ({ config: c }) => {
  const {
    moduleDir: dir,
    __CONFIG_KEY__: key,
    __VERSION__: version,
    isDogFood,
  } = c

  log.verbose('apply-version', dir)

  const pkg = await PackageJson.load(dir)

  /* istanbul ignore next */
  if (isDogFood) {
    delete pkg.content[key].version
  } else {
    if (pkg.content[key]) {
      pkg.content[key].version = version
    } else {
      pkg.content[key] = { version }
    }
  }

  await pkg.save()
}

module.exports = {
  run,
  when: ({ config: c }) => c.needsUpdate,
  name: 'apply-version',
}
