module.exports = testFile => testFile
  .replace(/^test\/bin\//, 'bin/')
  .replace(/^test\//, 'lib/')
