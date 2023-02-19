const semver = require('semver')
const Arborist = require('@npmcli/arborist')

const run = async ({ path, pkg, options, rule }) => {
  const { skipPackages = [] } = rule

  const pkgPath = options.relative('package.json')
  const arb = new Arborist({ path })
  const tree = await arb.loadActual({ forceActual: true })

  const engines = pkg.engines.node
  const deps = await tree.querySelectorAll(`#${pkg.name} > .prod:attr(engines, [node])`)

  const invalid = []
  for (const dep of deps) {
    if (skipPackages.includes(dep.name)) {
      continue
    }

    const depEngines = dep.target.package.engines.node
    if (!semver.subset(engines, depEngines)) {
      invalid.push({
        name: `${dep.name}@${dep.version}`,
        location: dep.location,
        engines: depEngines,
      })
    }
  }

  if (invalid.length) {
    const title = `The following production dependencies are not compatible with ` +
      `\`engines.node: ${engines}\` found in \`${pkgPath}\`:`
    return {
      title,
      body: invalid.map((dep) => [
        `${dep.name}:`,
        `  engines.node: ${dep.engines}`,
        `  location: ${dep.location}`,
      ].join('\n')).join('\n'),
      solution: 'Remove them or move them to devDependencies.',
    }
  }
}

module.exports = {
  name: 'engines',
  check: {
    run,
    when: ({ pkg }) => pkg.engines?.node,
  },
}
