
const hasPackage = require('../util/has-package.js')

const run = ({ pkg, config: { allowedPackages = [], unwantedPackages = [] } }) => {
  // ensure packages that should not be present are removed
  const hasUnwanted = unwantedPackages
    .filter((name) => !allowedPackages.includes(name))
    .filter((name) => hasPackage(pkg, name))

  if (hasUnwanted.length) {
    return {
      title: 'The following unwanted packages were found:',
      body: hasUnwanted,
      solution: `npm rm ${hasUnwanted.join(' ')}`,
    }
  }
}

module.exports = {
  run,
  when: ({ config: c }) => c.applyModule,
  name: 'check-unwanted-packages',
}
