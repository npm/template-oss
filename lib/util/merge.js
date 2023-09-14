const { mergeWith: _mergeWith } = require('lodash')

// Adapted from https://github.com/lodash/lodash/issues/3901#issuecomment-517983996
// Allows us to keep track of the current key during each merge so a customizer
// can make different merges based on the parent keys.
const mergeWith = (...args) => {
  const customizer = args.pop()
  const objects = args
  const sourceStack = []
  const keyStack = []
  return _mergeWith({}, ...objects, (value, srcValue, key, target, source) => {
    let currentKeys
    while (true) {
      if (!sourceStack.length) {
        sourceStack.push(source)
        keyStack.push([])
      }
      if (source === sourceStack[sourceStack.length - 1]) {
        currentKeys = keyStack[keyStack.length - 1].concat(key)
        sourceStack.push(srcValue)
        keyStack.push(currentKeys)
        break
      }
      sourceStack.pop()
      keyStack.pop()
    }
    // Remove the last key since that is the current one and reverse the whole
    // array so that the first entry is the parent, 2nd grandparent, etc
    return customizer(value, srcValue, key, target, source, currentKeys.slice(0, -1).reverse())
  })
}

// Create a merge function that will run a set of customizer functions
const mergeWithCustomizers = (...customizers) => {
  return (...objects) => mergeWith({}, ...objects, (...args) => {
    for (const customizer of customizers) {
      const result = customizer(...args)
      // undefined means the customizer will defer to the next one
      // the default behavior of undefined in lodash is to merge
      if (result !== undefined) {
        return result
      }
    }
  })
}

const customizers = {
  // Dont merge arrays, last array wins
  overwriteArrays: (value, srcValue) => {
    if (Array.isArray(srcValue)) {
      return srcValue
    }
  },
  // Merge arrays if their key matches one of the passed in keys
  mergeArrays: (...keys) => (value, srcValue, key) => {
    if (Array.isArray(srcValue)) {
      if (keys.includes(key)) {
        return (Array.isArray(value) ? value : []).concat(srcValue)
      }
      return srcValue
    }
  },
}

module.exports = {
  // default merge is to overwrite arrays
  merge: mergeWithCustomizers(customizers.overwriteArrays),
  mergeWithCustomizers,
  mergeWith,
  customizers,
}
