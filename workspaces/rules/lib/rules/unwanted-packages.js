
const hasPackage = require('../has-package.js')

const run = ({ pkg, rule }) => {
  const { unwantedPackages = [] } = rule

  // ensure packages that should not be present are removed
  const hasUnwanted = unwantedPackages.filter((name) => hasPackage(pkg, name))

  if (hasUnwanted.length) {
    return {
      title: 'The following unwanted packages were found:',
      body: hasUnwanted,
      solution: `npm rm ${hasUnwanted.join(' ')} ${pkg.flags}`,
    }
  }
}

module.exports = {
  name: 'unwanted-packages',
  check: run,
}
