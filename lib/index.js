const log = require('proc-log')
const getPackages = require('./options.js')

const prefixLog = (...prefix) => log.LEVELS.reduce((acc, k) => {
  acc[k] = (...args) => log[k](...prefix, ...args)
  return acc
}, {})

const runAll = async (root, { command, force }) => {
  const results = []

  const [pkgs, options] = await getPackages(root, { force })

  console.error(options)

  log.verbose('run', {
    root: options.rootPkg.path,
    paths: options.pkgs.map(p => p.path),
  })

  for (const pkg of pkgs) {
    const pkgLog = prefixLog(pkg.name)

    pkgLog.info('run')


    for (const rule of pkg.rules.flat()) {
      const ruleLog = prefixLog(`${pkg.name}:${rule.name}`)

      const ruleCommands = Object.entries([].concat(rule.commands[command])) 
      for (const [ruleIndex, ruleCommand] of ruleCommands) {

      }



      if (!command) {
        continue
      }

      const ruleOptions = {}

      if (typeof rule.when === 'function') {
        ruleLog.info('attempting to run rule')
        if (!await rule.when(ruleOptions)) {
          ruleLog.info('skipping')
          continue
        }
      }

      ruleLog.info('running')
      const runResults = await rule.run(ruleOptions)
      ruleLog.info('done')

      if (runResults) {
        // checks can return multiple results or nothing
        // so flatten first and remove nulls before returning
        results.push(...[].concat(runResults).flat().filter(Boolean))
      }
    }

    // // pkgLog.verbose('options', options)

    // const rules = getRules(command, { ...options, pkg })
    // pkgLog.info('rules', rules.map(r => r.name).join(','))

    // // files can export multiple checks so flatten first
    // for (const { when, run, name, rule, baseDirs, data: ruleData } of rules.flat()) {
    //   const ruleLog = prefixLog(`${pkg.name}:${name}`)

    //   ruleLog.verbose('rule options', rule)

    //   const ruleOptions = {

    //     baseDirs,
    //     rule,
    //     log: ruleLog,
    //   }

    //   ruleOptions.pkg.data = mergeData([{ values: ruleOptions.pkg.data }, ruleData], options)
    //   ruleOptions.rootPkg.data = mergeData(
    //     [{ values: ruleOptions.rootPkg.data }, ruleData],
    //     options
    //   )

    //   ruleOptions.data = {
    //     pkg: ruleOptions.pkg,
    //     rootPkg: ruleOptions.rootPkg,
    //     repo: ruleOptions.repo,
    //     pkgs: ruleOptions.pkgs,
    //     wsPkg: ruleOptions.wsPkgs,
    //     options: ruleOptions.options,
    //     // merge in the current pkg data as top level data in templates
    //     ...ruleOptions.pkg?.data,
    //   }
    // }
  }

  return results
}

module.exports = runAll
