module.exports = {
  rootRepo: {
    add: {
      'target.yml': {
        file: 'source.yml',
        parser: (p) => class extends p.YmlMerge {
          key = 'key'
          id = 'id'
        },
      },
    },
  },
}
