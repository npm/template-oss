const { name: NAME } = require('../../package.json')
const { minimatch } = require('minimatch')

const parseDependabotConfig = v => (typeof v === 'string' ? { strategy: v } : (v ?? {}))

module.exports = (config, defaultConfig, branches) => {
  const { dependabot, dependabotInterval } = config
  const { dependabot: defaultDependabot, dependabotInterval: defaultInterval } = defaultConfig

  if (!dependabot) {
    return false
  }

  return branches
    .filter(b => dependabot[b] !== false)
    .map(branch => {
      const isReleaseBranch = minimatch(branch, config.releaseBranch)

      // Determine the interval to use: branch-specific > package-specific > default
      const interval = parseDependabotConfig(dependabot[branch]).interval || dependabotInterval || defaultInterval

      return {
        branch,
        interval,
        allowNames: isReleaseBranch ? [NAME] : [],
        labels: isReleaseBranch ? ['Backport', branch] : [],
        ...parseDependabotConfig(defaultDependabot),
        ...parseDependabotConfig(dependabot),
        ...parseDependabotConfig(dependabot[branch]),
      }
    })
}
