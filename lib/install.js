const spawn = require('@npmcli/promise-spawn')

const removeDeps = [
  'eslint-plugin-import',
  'eslint-plugin-promise',
  'eslint-plugin-standard',
  '@npmcli/lint',
]

const devDeps = [
  'eslint',
  'eslint-plugin-node',
  '@npmcli/eslint-config',
  'tap',
]

const npm = (root, args) => {
  return spawn('npm', args, {
    cwd: root,
    stdioString: true,
  })
}

const installPackages = async (root) => {
  await npm(root, ['uninstall', ...removeDeps])
  return npm(root, ['install', '--save-dev', ...devDeps])
}
installPackages.removeDeps = removeDeps
installPackages.devDeps = devDeps

module.exports = installPackages
