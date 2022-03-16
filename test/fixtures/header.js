
module.exports = {
  rootRepo: {
    add: {
      'header.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          static header = 'Different header'
        },
      },
      'noheader.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          static header = null
        },
      },
      'nocomment.txt': {
        file: 'source.txt',
        parser: (p) => class extends p.Base {
          comment = null
        },
      },
    },
  },
}
