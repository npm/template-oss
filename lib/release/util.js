const semver = require('semver')

module.exports.specRe = new RegExp(`([^\\s]+@${semver.src[semver.tokens.FULLPLAIN]})`, 'g')

module.exports.code = (c) => `\`${c}\``
module.exports.link = (text, url) => `[${text}](${url})`
module.exports.list = (text) => `* ${text}`

module.exports.dateFmt = (date = new Date()) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return [year, month, day].join('-')
}

// TODO: test this
/* istanbul ignore next */
module.exports.getPublishTag = (v, { backport, defaultTag }) => {
  const version = semver.parse(v)
  return version.prerelease.length
    ? `prerelease-${version.major}`
    : backport ? `latest-${backport}`
    : defaultTag.replace(/{{\s*major\s*}}/, version.major)
}

module.exports.makeGitHubUrl = (owner, repo) =>
  (...p) => `https://github.com/${owner}/${repo}/${p.join('/')}`
