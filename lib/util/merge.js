const { mergeWith } = require('lodash')

const merge = (...objects) => mergeWith({}, ...objects, (value, srcValue, key) => {
  if (Array.isArray(srcValue)) {
    // Dont merge arrays, last array wins
    return srcValue
  }
})

const mergeWithArrays = (...keys) =>
  (...objects) => mergeWith({}, ...objects, (value, srcValue, key) => {
    if (Array.isArray(srcValue)) {
      if (keys.includes(key)) {
        return (Array.isArray(value) ? value : []).concat(srcValue)
      }
      return srcValue
    }
  })

module.exports = merge
module.exports.withArrays = mergeWithArrays
