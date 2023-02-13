const { mergeWith } = require('lodash')

const mergeWithArrays = (...keys) =>
  (...objects) => mergeWith({}, ...objects, (value, srcValue, key) => {
    if (Array.isArray(srcValue)) {
      if (keys.includes(key)) {
        return (Array.isArray(value) ? value : []).concat(srcValue)
      }
      return srcValue
    }
  })

module.exports = mergeWithArrays
