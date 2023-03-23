const { identity } = require('lodash')
const { merge } = require('./merge')
const { basename } = require('path')
const { resolvePath } = require('./resolve-config.js')
const { getRootOrWorkspace } = require('./data')
const { getData } = require('./data')

const result = (obj, key, ...args) => {
  if (typeof obj[key] === 'function') {
    return obj[key](...args)
  }
  return obj[key]
}

// Resolve a rule object so each key is the fully resolved path so
// other rule objects can merge accurately
const resolveRules = (pkg) => {
  const resolvedRules = {
    [require.resolve('./rules/self-installed')]: { config: [] },
    [require.resolve('./rules/version')]: { config: [] },
  }

  for (const { config, baseDir } of pkg.config) {
    const configRules = Object.entries(config.rules || {})

    for (const [rulePath, ruleConfig] of configRules) {
      const resolvedPath = resolvePath(rulePath, baseDir)
      if (!resolvedPath) {
        continue
      }
      if (!resolvedRules[resolvedPath]) {
        resolvedRules[resolvedPath] = { baseDir, config: [] }
      }
      resolvedRules[resolvedPath].config.push(ruleConfig)
    }
  }

  return Object.entries(resolvedRules)
}

// for (const rule of resolvedRules) {
//   if (ruleCommands) {
//     // const x = config.flatMap(() => )

//     const ruleOpts = mergeRule(...ruleLayers.flatMap(ruleLayer => {
//       const layerConfigs = getConfigs(ruleLayer.options, options)
//       return layerConfigs.map(c => config(c, baseDir, options))
//     }))

//     const ruleData = {
//       options: { ...data.options },
//       values: {
//         ...(typeof data.values === 'function' ? data.values(ruleOpts, options) : data.values),
//       },
//     }

//     const ruleSteps = Object.entries([].concat(ruleCommands))
//     for (const [index, ruleCommand] of ruleSteps) {
//       const { name: stepName, ...step } = typeof ruleCommand === 'function'
//         ? { run: ruleCommand, name: index } : ruleCommand
//       const ruleName = stepName ?? (ruleSteps.length > 1 ? index.toString() : '')
//       rules.push({
//         run: step.run,
//         when: step.when,
//         name: `${name}${ruleName ? `:${ruleName}` : ''}`,
//         data: ruleData,
//         baseDirs: [baseDir],
//         rule: ruleOpts,
//       })
//     }
//   }
// }

const getRules = (pkg, baseOptions) => {
  const rules = []
  for (const [rulePath, { baseDir, config: ruleConfigs }] of resolveRules(pkg)) {
    const {
      name = basename(rulePath),
      config: normalizeConfig = identity,
      merge: mergeRule = merge,
      data = {},
      commands = {},
    } = require(rulePath)

    const ruleConfig = mergeRule(...ruleConfigs.flatMap(rc => {
      return getRootOrWorkspace(rc, baseOptions).map(c => {
        return normalizeConfig(c, baseDir, baseOptions)
      })
    }))

    const ruleData = getData([{
      config: {
        options: { ...data.options },
        values: { ...result(data, 'values', ruleConfig, baseOptions) },
      },
    }], baseOptions)

    const ruleCommands = Object.entries(commands).reduce((acc, [key, value]) => {
      acc[key] = [].concat(value).map((ruleCommand, index, list) => {
        const command = typeof ruleCommand === 'function'
          ? { run: ruleCommand, name: index }
          : ruleCommand
        const ruleName = command.name ?? (list.length > 1 ? index.toString() : '')
        return {
          name: `${name}${ruleName ? `:${ruleName}` : ''}`,
          run: command.run,
          when: command.when,
        }
      })
      return acc
    })

    rules.push({
      name,
      baseDir,
      config: ruleConfig,
      data: ruleData,
      commands: ruleCommands,
    })
  }

  return rules
}

module.exports = {
  getRules,
}
