'use strict'

module.exports = {
  DEBUG: process.env.DEBUG != null,
  round,
  parseNumber,
  timer,
  printSection,
  createIterator
}

// error class indicating an invalid value was passed in
class InvalidInputValueError extends Error {
  constructor (message) {
    super(message)
    this.invalidInputValue = true
  }
}

// ughh, classes aren't hoisted
module.exports.InvalidInputValueError = InvalidInputValueError

// round a number to the specified number of decimal points
function round (number, decimals = 0) {
  if (decimals === 0) return Math.round(number)

  const scalar = Math.pow(10, decimals)
  return Math.round(number * scalar) / scalar
}

// parse a string into a number
function parseNumber (string) {
  if (string == null) return null

  string = `${string}`.trim()
  const number = parseFloat(string, 10)

  if (isNaN(number)) return null

  return number
}

// create a timer; returns function, which when called, returns elapsed ms
function timer () {
  const start = Date.now()

  return function stopTimer () {
    return Date.now() - start
  }
}

function printSection (label) {
  console.log('')
  // console.log('---------------------------------------------------------------')
  console.log(label)
  // console.log('---------------------------------------------------------------')
}

// create an iterator given an initial state and next function
function createIterator (state, nextFn) {
  class CreatedIterator {
    constructor () {
      this.state = state
    }

    [Symbol.iterator] () {
      return this
    }

    next () {
      // function takes state and a done signal; if it returns the done signal,
      // it's done, otherwise it returns the next iterator value
      const doneSignal = {}
      const item = nextFn(this.state, doneSignal)

      if (item === doneSignal) return { done: true }

      return {
        done: false,
        value: item
      }
    }
  }

  return new CreatedIterator()
}

// cli tester
if (require.main === module) main()

function main () {
  const iterator = createIterator([1, 10], (state, done) => {
    const [next, finish] = state
    if (next > finish) return done
    state[0] = next + 1
    return next
  })

  for (let n of iterator) {
    console.log(n)
  }
}
