'use strict'

module.exports = {
  getText
}

// get a texutual description of a moon phase
function getText (value) {
  const offset = 1 / 16

  const states = [
    [ 0 / 8, 'new moon' ],
    [ 1 / 8, 'waning crescent' ],
    [ 2 / 8, 'waning' ],
    [ 3 / 8, 'waning gibbous' ],
    [ 4 / 8, 'full moon' ],
    [ 5 / 8, 'waxing gibbous' ],
    [ 6 / 8, 'waxing' ],
    [ 7 / 8, 'waxing cresecent' ]
  ]

  for (const [ sValue, sName ] of states) {
    if ((value >= sValue - offset) && (value <= sValue + offset)) {
      return sName
    }
  }

  // must be almost new moon
  return states[0][1]
}
