const Version = require('./version.js')
const RP = require('release-please/build/src/plugins/node-workspace')

module.exports = class NodeWorkspace extends RP.NodeWorkspace {
  bumpVersion (pkg) {
    // The default release please node-workspace plugin forces a patch
    // bump for the root if it only includes workspace dep updates.
    // This does the same thing except it respects the prerelease config.
    return new Version(pkg).bump(pkg.version, [{ type: 'fix' }])
  }
}
