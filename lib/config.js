const { merge: _merge } = require('lodash')
const { resolvePath } = require('./resolve-config.js')

const merge = (...o) => _merge({}, ...o)

// Lookup a key in any config. First lookup the toplevel key
// and then lookup the same key in either the toplevel `root`
// or `workspace` objects
const getConfigs = (config, key, options) => {
  const shared = config[key]
  return [
    shared,
    options.isRoot ? config.root?.[key] : config.workspace?.[key],
  ]
}

// Get the `data` config object and run it through the `postData`
// config function at each layer and then merge the results
const getData = (options) => {
  const dataLayers = options.pkg.config.map(c => {
    const res = []
    const datas = getConfigs(c.config, 'data', options)
    const postDatas = getConfigs(c.config, 'postData', options)
    for (const [index, data] of Object.entries(datas)) {
      const postData = typeof postDatas[index] === 'function' ? postDatas[index](data, options) : {}
      res.push(merge(data, postData))
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
        const layerRuleConfig = {
          ...ruleLayer,
          options: merge(...getConfigs(ruleLayer, 'options', options)),
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
