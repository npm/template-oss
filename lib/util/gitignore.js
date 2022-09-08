const { posix } = require('path')
const { uniq } = require('lodash')
const localeCompare = require('@isaacs/string-locale-compare')('en')

const sortGitPaths = (a, b) => localeCompare(a.replace(/^!/g, ''), b.replace(/^!/g, ''))

const allowDir = (p) => {
  const parts = p.split(posix.sep)
  return parts.flatMap((part, index, list) => {
    const prev = list.slice(0, index)
    const isLast = index === list.length - 1
    const ignorePart = ['', ...prev, part, ''].join(posix.sep)
    return [`!${ignorePart}`, !isLast && `${ignorePart}*`]
  }).filter(Boolean)
}

const allowRootDir = (p) => {
  // This negates the first part of each path for the gitignore
  // files. It should be used to allow directories where everything
  // should be allowed inside such as .github/. It shouldn't be used on
  // directories like `workspaces/` since we want to be explicit and
  // only allow each workspace directory individually. For those use
  // the allowDir method above.
  const [first, hasChildren] = p.split(posix.sep)
  return `${first}${hasChildren ? posix.sep : ''}`
}

const gitignore = {
  allowDir: (dirs) => uniq(dirs.map(allowDir).flat()),
  allowRootDir: (dirs) => dirs.map(allowRootDir).map((p) => `!${posix.sep}${p}`),
  sort: (arr) => uniq(arr.sort(sortGitPaths)),
}

module.exports = gitignore
