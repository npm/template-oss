const run = require('../index.js')

module.exports = root => run(root, [require('./apply-files.js'), require('./apply-version.js')])
