const log = require('proc-log')
const PackageJson = require('@npmcli/package-json')

const run = async ({ config: c }) => {
  const {
    moduleDir: dir,
    __CONFIG_KEY__: key,
    __VERSION__: version,
  } = c

  log.verbose('apply-version', dir)

  const pkg = await PackageJson.load(dir)
  if (!pkg.content[key]) {
    pkg.content[key] = { version }
  } else {
    pkg.content[key].version = version
  }
  await pkg.save()
}

module.exports = {
  run,
  when: ({ config: c }) => c.needsUpdate && !c.isDogFood,
  name: 'apply-version',
}
