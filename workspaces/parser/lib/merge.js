const { mergeWith } = require('lodash')

const merge = (...objects) => mergeWith({}, ...objects, (value, srcValue, key) => {
  if (Array.isArray(srcValue)) {
    // Dont merge arrays, last array wins
    return srcValue
  }
})

module.exports = merge
