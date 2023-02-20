const { merge: _merge, omit } = require('lodash')
const { basename } = require('path')
const { resolvePath } = require('./resolve-config.js')

const merge = (...o) => _merge({}, ...o)

// Lookup a key in any config. First lookup the toplevel key
// and then lookup the same key in either the toplevel `root`
// or `workspace` objects
const getConfigs = (config = {}, options) => {
  const shared = omit(config, 'root', 'workspace')
  const pkg = options.pkg.isRoot ? config.root : config.workspace
  return [shared, pkg ?? {}]
}

// Get the `data` config object and run it through the `postData`
// config function at each layer and then merge the results
const getData = (options) => {
  const dataLayers = options.pkg.config.map(c => {
    const res = []
    const dataConfigs = getConfigs(c.config.data, options)
    for (const { values, postData } of dataConfigs) {
      const pData = typeof postData === 'function' ? postData(values, options) : {}
      res.push(merge(values, pData))
    }
    return merge(...res)
  })
  return merge(...dataLayers)
}

// Resolve a rule object so each key is the fully resolved path so
// other rule objects can merge accurately
const resolveRules = (options) => {
  const resolvedRules = {
    [require.resolve('./rules/self-installed')]: { config: [] },
    [require.resolve('./rules/version')]: { config: [] },
  }

  for (const { config, baseDir } of options.pkg.config) {
    const configRules = Object.entries(config.rules || {})

    for (const [rulePath, ruleConfig] of configRules) {
      const resolvedPath = resolvePath(rulePath, baseDir)
      if (!resolvedRules[resolvedPath]) {
        resolvedRules[resolvedPath] = { baseDir, config: [] }
      }
      resolvedRules[resolvedPath].config.push(ruleConfig)
    }
  }

  return resolvedRules
}

const getRules = (command, options) => {
  const resolvedRules = resolveRules(options)
  const rules = []

  for (const [rulePath, { config: ruleLayers, baseDir }] of Object.entries(resolvedRules)) {
    const { name = basename(rulePath), config, data, [command]: ruleCommands } = require(rulePath)

    if (ruleCommands) {
      const rule = merge(...ruleLayers.map(ruleLayer => {
        const ruleOptions = getConfigs(ruleLayer.options, options)
          .map(c => config ? config(c, baseDir, options) : c)
        return {
          ...ruleLayer,
          baseDirs: [baseDir],
          options: merge(...ruleOptions),
        }
      }))
      const ruleSteps = Object.entries([].concat(ruleCommands))
      for (const [index, ruleCommand] of ruleSteps) {
        const { name: stepName, ...step } = typeof ruleCommand === 'function'
          ? { run: ruleCommand, name: index } : ruleCommand
        const ruleName = stepName ?? (ruleSteps.length > 1 ? index.toString() : '')
        rules.push({
          run: step.run,
          when: step.when,
          name: `${name}${ruleName ? `:${ruleName}` : ''}`,
          rule,
          data,
        })
      }
    }
  }

  return rules
}

module.exports = { getData, getRules }
