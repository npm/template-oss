const { mergeWith, omit, identity, uniq } = require('lodash')
const { basename } = require('path')
const { resolvePath } = require('./resolve-config.js')

const merge = (...v) => mergeWith({}, ...v, (_, srcValue) => {
  if (Array.isArray(srcValue)) {
    return srcValue
  }
})

const mergeWithArrays = (arrayKeys, ...objs) => mergeWith({}, ...objs, (value, srcValue, key) => {
  if (Array.isArray(srcValue) && arrayKeys.includes(key)) {
    const newValue = (value || []).concat(srcValue)
    if (srcValue.every(v => typeof v === 'string')) {
      return uniq(newValue)
    }
    return uniq(newValue)
  }
})

// Lookup a key in any config. First lookup the toplevel key
// and then lookup the same key in either the toplevel `root`
// or `workspace` objects
const getConfigs = (config = {}, options) => {
  const shared = omit(config, 'root', 'workspace')
  const pkg = options.pkg.isRoot ? config.root : config.workspace
  return [shared, pkg ?? {}]
}

const mergeData = (dataConfigs, options) => {
  const res = []
  const mergeArrays = []
  for (const { values = {}, postData, options: dataOptions = {} } of dataConfigs) {
    const pData = typeof postData === 'function' ? postData(values, options) : {}
    mergeArrays.push(...dataOptions.mergeArrays || [])
    res.push(mergeWithArrays(mergeArrays, values, pData))
  }
  return { data: mergeWithArrays(mergeArrays, ...res), mergeArrays }
}

// Get the `data` config object and run it through the `postData`
// config function at each layer and then merge the results
const getData = (options) => {
  const mergeArrays = []
  const dataLayers = options.pkg.config.map(c => {
    const dataConfigs = getConfigs(c.config.data, options)
    const res = mergeData(dataConfigs, options)
    mergeArrays.push(...res.mergeArrays)
    return res.data
  })
  return mergeWithArrays(mergeArrays, ...dataLayers)
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
    const {
      name = basename(rulePath),
      config = identity,
      data = {},
      [command]: ruleCommands,
    } = require(rulePath)

    if (ruleCommands) {
      const rule = merge(...ruleLayers.map(ruleLayer => {
        const ruleOptions = getConfigs(ruleLayer.options, options)
          .map(c => config(c, baseDir, options))
        return {
          baseDirs: [baseDir],
          options: merge(...ruleOptions),
        }
      }))

      const ruleData = () => {
        const res = {
          values: data.values,
          options: data.options,
        }
        if (typeof res.values === 'function') {
          res.values = res.values(rule.options, options)
        }
        return res
      }

      const ruleSteps = Object.entries([].concat(ruleCommands))
      for (const [index, ruleCommand] of ruleSteps) {
        const { name: stepName, ...step } = typeof ruleCommand === 'function'
          ? { run: ruleCommand, name: index } : ruleCommand
        const ruleName = stepName ?? (ruleSteps.length > 1 ? index.toString() : '')
        rules.push({
          run: step.run,
          when: step.when,
          name: `${name}${ruleName ? `:${ruleName}` : ''}`,
          data: ruleData,
          baseDirs: rule.baseDirs,
          rule: rule.options,
        })
      }
    }
  }

  return rules
}

module.exports = { getData, mergeData, getRules }
