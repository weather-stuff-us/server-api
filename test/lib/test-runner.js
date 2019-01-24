'use strict'

module.exports = testRunner

const path = require('path')

const tap = require('tap')

// return a function to run tape functions with nice names
//
// eg
// const runTest = require('./lib/test-runner')(__filename)
// ...
// runTest(function nameOfTest (t) { ... }
function testRunner (fileName) {
  fileName = getProjectPath(fileName)

  return function runTest (options, fn) {
    if (typeof options === 'function' && fn === undefined) {
      fn = options
      options = {}
    }

    const testName = `${fileName} - ${fn.name}`
    tap.test(testName, options, fn).catch(error => {
      console.error('Test Runner Error:', error)
    })
  }
}

// given a filename, get it's project-relative path
function getProjectPath (fileName) {
  return path.relative(path.join(__dirname, '..'), fileName)
}
