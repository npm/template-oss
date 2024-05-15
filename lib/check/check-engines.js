const semver = require('semver')
const { relative, join } = require('path')
const Arborist = require('@npmcli/arborist')

const run = async ({ root, path, pkg, config: { omitEngines = [] } }) => {
  const pkgPath = join(relative(root, path), 'package.json')
  const arb = new Arborist({ path })
  const tree = await arb.loadActual({ forceActual: true })

  const engines = pkg.engines.node
  const deps = await tree.querySelectorAll(`#${pkg.name} > .prod:attr(engines, [node])`)

  const invalid = []
  for (const dep of deps) {
    if (omitEngines.includes(dep.name)) {
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
    const title =
      `The following production dependencies are not compatible with ` +
      `\`engines.node: ${engines}\` found in \`${pkgPath}\`:`
    return {
      title,
      body: invalid
        .map(dep => [`${dep.name}:`, `  engines.node: ${dep.engines}`, `  location: ${dep.location}`].join('\n'))
        .join('\n'),
      solution: 'Remove them or move them to devDependencies.',
    }
  }
}

module.exports = {
  run,
  when: ({ pkg, config: c }) => c.applyModule && pkg.engines?.node,
  name: 'check-engines',
}
