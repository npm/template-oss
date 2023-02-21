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

const main = async (run, { argv = process.argv, env = process.env } = {}) => {
  const silly = argv.includes('--silly')
  const verbose = argv.includes('--verbose') || silly
  const info = argv.includes('--info') || verbose
  const levels = { silly, verbose, info }

  process.on('log', (lvl, ...args) => {
    if (levels[lvl] === false) {
      return
    }
    console.error(lvl, ...args)
  })

  try {
    const results = await run({
      global: env.npm_config_global === 'true',
      root: env.npm_config_local_prefix || process.cwd(),
      force: argv.includes('--force'),
    })
    if (results?.check) {
      console.log(outputProblems(results.check))
    }
  } catch (err) {
    console.error(err.stack)
    process.exitCode = 1
  }
}

module.exports = main
module.exports.output = outputProblems
