const run = require('../index.js')

module.exports = (root, content) => run(root, content, [
  require('./apply-files.js'),
  require('./apply-version.js'),
])
