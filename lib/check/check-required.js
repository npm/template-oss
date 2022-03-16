const hasPackage = require('../util/has-package.js')
const { groupBy } = require('lodash')

const run = ({ pkg, config: { requiredPackages = {} } }) => {
  // ensure required packages are present in the correct place

  const mustHave = Object.entries(requiredPackages).flatMap(([location, pkgs]) =>
  // first make a flat array of {name, version, location}
    Object.entries(pkgs).map(([name, version]) => ({
      name,
      version,
      location,
    })))
    .filter(({ name, version, location }) => !hasPackage(pkg, name, version, [location]))

  if (mustHave.length) {
    return Object.entries(groupBy(mustHave, 'location')).map(([location, specs]) => {
      const rm = specs.map(({ name }) => name).join(' ')
      const install = specs.map(({ name, version }) => `${name}@${version}`).join(' ')
      const installLocation = hasPackage.flags[location]

      return {
        title: `The following required ${location} were not found:`,
        body: specs.map(({ name, version }) => `${name}@${version}`),
        // solution is to remove any existing all at once but add back in by --save-<location>
        solution: [`npm rm ${rm}`, `npm i ${install} ${installLocation}`].join(' && '),
      }
    })
  }
}

module.exports = {
  run,
  when: ({ config: c }) => c.applyModule,
  name: 'check-required-packages',
}
