const semver = require('semver')

module.exports.specRe = new RegExp(`([^\\s]+@${semver.src[semver.tokens.FULLPLAIN]})`, 'g')

module.exports.code = (c) => `\`${c}\``
module.exports.link = (text, url) => url ? `[${text}](${url})` : text
module.exports.list = (text) => `* ${text}`

module.exports.dateFmt = (date = new Date()) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return [year, month, day].join('-')
}
