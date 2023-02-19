#!/usr/bin/env node

const run = require('../lib/index.js')
const cli = require('../lib/cli.js')

cli((opts) => {
  // do nothing in global mode during postinstall
  if (opts.global) {
    return
  }
  return run(opts.root, { command: 'apply', ...opts })
})
