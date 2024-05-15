const { name: NAME } = require('../../package.json')
const { minimatch } = require('minimatch')

const parseDependabotConfig = v => (typeof v === 'string' ? { strategy: v } : v ?? {})

module.exports = (config, defaultConfig, branches) => {
  const { dependabot } = config
  const { dependabot: defaultDependabot } = defaultConfig

  if (!dependabot) {
    return false
  }

  return branches
    .filter(b => dependabot[b] !== false)
    .map(branch => {
      const isReleaseBranch = minimatch(branch, config.releaseBranch)
      return {
        branch,
        allowNames: isReleaseBranch ? [NAME] : [],
        labels: isReleaseBranch ? ['Backport', branch] : [],
        ...parseDependabotConfig(defaultDependabot),
        ...parseDependabotConfig(dependabot),
        ...parseDependabotConfig(dependabot[branch]),
      }
    })
}
