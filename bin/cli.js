#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

// run main if this is the main module launched
if (require.main === module) setImmediate(main)

// main program
function main () {
  help()
}

function help () {
  const readmeName = path.join(__dirname, 'HELP.md')
  const readme = fs.readFileSync(readmeName, 'utf8')
  console.log(readme)
  process.exit(1)
}
