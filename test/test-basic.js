const runTest = require('./lib/test-runner')(__filename)

// test for basic invalid steps
runTest(function basic (t) {
  t.pass('need to add tests')
  t.end()
})
