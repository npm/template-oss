module.exports = {
  rootRepo: {
    add: {
      'target.yml': {
        file: 'source.yml',
        parser: (p) => class extends p.YmlMerge {
          static key = 'key'
          static id = 'id'
        },
      },
    },
  },
}
