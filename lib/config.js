const PackageJson = require('@npmcli/package-json')
const mapWorkspaces = require('@npmcli/map-workspaces')

const defaultConfig = {
  applyRootRepoFiles: true,
  applyWorkspaceRepoFiles: true,
  applyRootModuleFiles: true,
  workspaces: [],
  paths: [],
}

module.exports = async (root) => {
  let pkg
  let pkgError = false
  try {
    pkg = (await PackageJson.load(root)).content
  } catch (e) {
    pkgError = true
  }
  if (pkgError || !pkg.templateOSS) {
    return {
      ...defaultConfig,
      paths: [root],
    }
  }
  const config = {
    ...defaultConfig,
    ...pkg.templateOSS,
  }
  const workspaceMap = await mapWorkspaces({
    pkg,
    cwd: root,
  })
  const wsPaths = []
  const workspaceSet = new Set(config.workspaces)
  for (const [name, path] of workspaceMap.entries()) {
    if (workspaceSet.has(name)) {
      wsPaths.push(path)
    }
  }
  config.workspacePaths = wsPaths

  config.paths = config.paths.concat(config.workspacePaths)

  config.paths.push(root)

  return config
}
