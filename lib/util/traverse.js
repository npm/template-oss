const traverse = (value, visit, keys = []) => {
  if (keys.length) {
    const res = visit(keys, value)
    if (res != null) {
      return
    }
  }
  if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      traverse(v, visit, keys.concat(k))
    }
  }
}

module.exports = traverse
