const semver = require('semver')
const Arborist = require('@npmcli/arborist')

const run = async ({ pkg, rule, log }) => {
  const { skipPackages = [] } = rule

  const arb = new Arborist({ path: pkg.path })
  const tree = await arb.loadActual({ forceActual: true })

  const engines = pkg.json.engines.node
  const query = `#${pkg.name} > .prod:attr(engines, [node])`
  log.info(query)
  const deps = await tree.querySelectorAll()

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
    const pkgPath = pkg.relativeToRoot('package.json')
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
    when: ({ pkg }) => pkg.json.engines?.node,
  },
}
