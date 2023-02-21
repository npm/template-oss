const { name: NAME, version: VERSION } = require('../package.json')

module.exports = {
  name: NAME,
  nameFs: NAME.replace(/\//g, '-').replace(/@/g, ''),
  nameBranch: NAME.replace(/@/g, '/'),
  version: VERSION,
  configKey: 'templateOSS',
  defaultConfig: '@npmcli/template-oss-config',
}
