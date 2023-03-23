const { omit } = require('lodash')
const { mergeWithArrays } = require('./merge')

const mergeDataOptions = mergeWithArrays('mergeArrays')

// Lookup a key in any config. First lookup the toplevel key
// and then lookup the same key in either the toplevel `root`
// or `workspace` objects
const getRootOrWorkspace = (data = {}, options) => {
  const sharedData = omit(data, 'root', 'workspace')
  const pkgData = options.pkg.isRoot ? data.root : data.workspace
  return [sharedData, pkgData].filter(Boolean)
}

// Get the `data` config object and run it through the `postData`
// config function at each layer and then merge the results
const getData = (configs, baseOptions) => {
  const dataLayers = configs.flatMap(({ config }) =>
    getRootOrWorkspace(config.data, baseOptions))

  const allLayers = dataLayers.reduce((acc, data) => {
    if (data.values) {
      acc.values.push(data.values)
    }
    if (data.options) {
      acc.options.push(data.options)
    }
    if (data.postData) {
      acc.postData.push(data.postData)
    }
    return acc
  }, { values: [], options: [], postData: [] })

  const mergedOptions = mergeDataOptions(...allLayers.options)
  const mergeValues = mergeWithArrays(...mergedOptions.mergeArrays ?? [])

  const allData = []
  for (const values of allLayers.values) {
    allData.push(values)
    for (const fn of allLayers.postData) {
      allData.push(fn(values, baseOptions))
    }
  }

  return mergeValues(...allData)
}

module.exports = {
  getData,
  getRootOrWorkspace,
}
