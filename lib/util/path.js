const { posix, win32 } = require('path')

const makePosix = v => v.split(win32.sep).join(posix.sep)
const deglob = v => makePosix(v).replace(/[/*]+$/, '')
const posixDir = v => `${v === '.' ? '' : deglob(v).replace(/\/$/, '')}${posix.sep}`
const posixGlob = str => `${posixDir(str)}**`

module.exports = {
  makePosix,
  deglob,
  posixDir,
  posixGlob,
}
