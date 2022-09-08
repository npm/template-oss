const run = require('../index.js')

module.exports = (root) => run(root, [
  require('./check-apply.js'),
  require('./check-required.js'),
  require('./check-unwanted.js'),
  require('./check-gitignore.js'),
  require('./check-changelog.js'),
])
