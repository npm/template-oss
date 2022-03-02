const indent = (v, i = 2) => {
  if (Array.isArray(v)) {
    return v.map((a) => indent(a, i)).join('\n')
  }
  return v.toString().split('\n').map((l) => ' '.repeat(i) + l).join('\n')
}

const output = () => {
  const res = []
  const push = (...parts) => res.push(parts.join('\n'))
  return {
    toString: () => res.join('\n'),
    sep: () => push('', '-'.repeat(67), ''),
    push,
  }
}

const outputProblems = (problems) => {
  const o = output()
  o.push('', 'Some problems were detected:')
  o.sep()
  for (const { title, body, solution } of problems) {
    const [solutionTitle, ...solutionRest] = Array.isArray(solution)
      ? solution : [solution]
    o.push(title, '', indent(body), '', `To correct it: ${solutionTitle}`)
    if (solutionRest.length) {
      o.push('', indent(solutionRest))
    }
    o.sep()
  }

  return o.toString()
}

module.exports = outputProblems
