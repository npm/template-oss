const { name, version } = require('../constants.js')

// ensure required packages are present in the correct place
const run = ({ pkg }) => {
  const devDeps = pkg.json.devDependencies || {}

  const solution = `npm i ${name} -D --save-exact ${pkg.flags}`.trim()

  // not installed at all. this check could be running via npx or something
  // so we need to say to install this
  if (!devDeps[name]) {
    return {
      title: `${name} must be installed as a devDependency`,
      solution,
    }
  }

  if (devDeps[name] !== version) {
    return {
      title: `${name} must be pinned to the installed version '${version}'`,
      solution,
    }
  }
}

module.exports = {
  name: 'self-installed',
  check: {
    run,
    when: (o) => !o.options.isDogFood,
  },
}
