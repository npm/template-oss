const semver = require('semver')

const SPEC = new RegExp(`([^\\s]+@${semver.src[semver.tokens.FULLPLAIN]})`, 'g')
const code = (c) => `\`${c}\``
const wrapSpecs = (str) => str.replace(SPEC, code('$1'))
const block = (lang) => `\`\`\`${lang ? `${lang}` : ''}`
const link = (text, url) => `[${text}](${url})`
const list = (text) => `* ${text}`
const formatDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return [year, month, day].join('-')
}

const getPublishTag = (v, { backport, defaultTag }) => {
  const version = semver.parse(v)
  return version.prerelease.length
    ? `prerelease-${version.major}`
    : backport ? `latest-${backport}`
    : defaultTag.replace(/{{\s*major\s*}}/, version.major)
}

const makeGitHubUrl = (owner, repo) =>
  (...p) => `https://github.com/${owner}/${repo}/${p.join('/')}`

const noop = () => {}

module.exports = {
  // we use this string a lot, its duplicated in the changelog sections but its hard
  // to access from within release please so we keep it here also.
  DEPS: 'deps',
  wrapSpecs,
  code,
  block,
  link,
  list,
  formatDate,
  getPublishTag,
  makeGitHubUrl,
  noop,
}
