const log = require('proc-log')
const npa = require('npm-package-arg')
const { partition } = require('lodash')
const hasPackage = require('../util/has-package.js')

const rmCommand = (specs) =>
  `npm rm ${specs.map((s) => s.name).join(' ')}`.trim()

const installCommand = (specs, flags) => specs.length ?
  `npm i ${specs.map((s) => `${s.name}@${s.fetchSpec}`).join(' ')} ${flags.join(' ')}`.trim() : ''

// ensure required packages are present in the correct place
const run = ({ pkg, path, config: { requiredPackages = {} } }) => {
  // keys are the dependency location in package.json
  // values are a filtered list of parsed specs that dont exist in the current package
  // { [location]: [spec1, spec2] }
  const requiredByLocation = Object.entries(requiredPackages)
    .reduce((acc, [location, pkgs]) => {
      acc[location] = pkgs
        .filter((spec) => !hasPackage(pkg, spec, [location], path))
        .map((spec) => npa(spec))
      log.verbose(location, pkg, pkgs)
      return acc
    }, {})

  const requiredEntries = Object.entries(requiredByLocation)

  log.verbose('check-required', requiredEntries)

  if (requiredEntries.flatMap(([, specs]) => specs).length) {
    return requiredEntries.map(([location, specs]) => {
      const locationFlag = hasPackage.flags[location]
      const [exactSpecs, saveSpecs] = partition(specs, (s) => s.type === 'version')

      log.verbose('check-required', location, specs)

      return {
        title: `The following required ${location} were not found:`,
        body: specs.map((s) => s.rawSpec ? `${s.name}@${s.rawSpec}` : s.name),
        // solution is to remove any existing all at once but add back in by --save-<location>
        solution: [
          rmCommand(specs),
          installCommand(saveSpecs, [locationFlag]),
          installCommand(exactSpecs, [locationFlag, '--save-exact']),
        ].filter(Boolean).join(' && '),
      }
    })
  }
}

module.exports = {
  run,
  when: ({ config: c }) => c.applyModule,
  name: 'check-required-packages',
}
