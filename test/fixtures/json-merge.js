module.exports = {
  rootRepo: {
    add: {
      'target.json': {
        file: 'source.json',
        parser: (p) => p.JsonMerge,
      },
    },
  },
}
