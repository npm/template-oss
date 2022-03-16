const run = require('../index.js')

module.exports = (root, content) => run(root, content, [
  require('./check-apply.js'),
  require('./check-required.js'),
  require('./check-unwanted.js'),
  require('./check-gitignore.js'),
  require('./check-changelog.js'),
])
