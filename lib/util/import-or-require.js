// This fixes weird behavior I was seeing where calls to require(path) would
// fail the first time and then fetch via dynamic import which is correct, but
// then subsequent requires for the same path would return an empty object. Not
// sure if a bug or I'm doing something wrong but since the require/imports here
// are short lived, it is safe to create our own cache and use that.
const { pathToFileURL } = require('url')

const importOrRequireCache = new Map()

const importOrRequire = async (path) => {
  if (importOrRequireCache.has(path)) {
    return importOrRequireCache.get(path)
  }
  let content = {}
  try {
    content = require(path)
  } catch {
    try {
      content = await import(pathToFileURL(path)).then(r => r.default)
    } catch {
      // its ok if this fails since the content dir might only be to provide
      // other files. the index.js is optional
    }
  }
  importOrRequireCache.set(path, content)
  return content
}

module.exports = importOrRequire
