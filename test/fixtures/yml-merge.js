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
      'clean-target.yml': {
        file: 'source.yml',
        clean: () => true,
        parser: (p) => class extends p.YmlMerge {
          key = 'key'
          id = 'id'
        },
      },
    },
  },
}
