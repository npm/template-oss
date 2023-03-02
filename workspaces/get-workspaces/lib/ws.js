const { join, relative } = require('path')
const mapWorkspaces = require('@npmcli/map-workspaces')

const wsFlags = ({ root, workspaces }) => {
  return [root ? '-iwr' : '', ...workspaces.map(ws => `-w="${ws.name}"`)].join(' ').trim()
}

const main = async ({ cwd, files, all }) => {
  const wsMap = await mapWorkspaces({
    cwd,
    pkg: require(join(cwd, 'package.json')),
  })

  const workspaces = [...wsMap.entries()].map(([name, path]) => ({
    name,
    path: relative(cwd, path),
  }))

  if (all) {
    return wsFlags({ root: true, workspaces })
  }

  let changedRoot = false
  const changedWorkspaces = new Set()

  for (const file of files) {
    let foundWs = false
    for (const ws of workspaces) {
      foundWs = file.startsWith(ws.path)
      if (foundWs) {
        changedWorkspaces.add(ws)
        break
      }
    }
    if (!foundWs) {
      changedRoot = true
    }
  }

  return {
    flags: wsFlags({ root: changedRoot, workspaces: [...changedWorkspaces.values()] }),
  }
}

module.exports = main
