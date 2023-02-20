const { merge: _merge, pick, omit } = require('lodash')
const { resolvePath } = require('./resolve-config.js')

const merge = (...o) => _merge({}, ...o)

// Lookup a key in any config. First lookup the toplevel key
// and then lookup the same key in either the toplevel `root`
// or `workspace` objects
const getConfigs = (config, keys, options) => {
  const shared = pick(config, keys)
  const pkg = options.pkg.isRoot ? config.root : config.workspace
  return [shared, pkg].map(c => pick(c, keys))
}

// Get the `data` config object and run it through the `postData`
// config function at each layer and then merge the results
const getData = (options) => {
  const dataLayers = options.pkg.config.map(c => {
    const res = []
    const datas = getConfigs(c.config, ['data', 'postData'], options)
    for (const { data, postData } of datas) {
      const pData = typeof postData === 'function' ? postData(data, options) : {}
      res.push(merge(data, pData))
    }
    return merge(...res)
  })
  return merge(...dataLayers)
}

// Resolve a rule object so each key is the fully resolved path so
// other rule objects can merge accurately
const resolveRules = (options) => {
  const resolvedRules = {}

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
    const { name, config, data, [command]: ruleCommands } = require(rulePath)

    if (ruleCommands) {
      const rule = merge(...ruleLayers.map(ruleLayer => {
        const mergeKeys = ['files', 'rootFiles']
        const layerRuleConfig = {
          ...ruleLayer,
          options: {
            ...omit(ruleLayer.options, mergeKeys),
            ...merge(...getConfigs(ruleLayer.options, mergeKeys, options)),
          },
          baseDir,
        }
        return config ? config(layerRuleConfig, options) : layerRuleConfig
      }))
      const getOptions = (o) => {
        const res = { rule }
        if (data) {
          res.rootData = merge(o.rootData, data(rule, o))
          res.data = merge(o.data, data(rule, o))
        }
        return res
      }
      for (const [index, ruleCommand] of Object.entries([].concat(ruleCommands))) {
        const action = typeof ruleCommand === 'function' ? { run: ruleCommand } : ruleCommand
        rules.push({
          path: rulePath,
          name: `${name} ${index}`,
          options: getOptions,
          ...action,
        })
      }
    }
  }

  return rules
}

module.exports = { getData, getRules }
