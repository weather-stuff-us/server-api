'use strict'

// deal with data from https://api.weather.gov/gridpoints/RAH/67,53

module.exports = {
  transform
}

const dateLocalize = require('./date-localize')
const dateNormalize = require('./date-normalize')

// convert
//   { [prop]: {uom, values: [{validTime, value}]} }
// into
//    {[time]: { [prop]: value }}
function transform (gridData, timeZone) {
  const props = Object.keys(gridData)
  const timeMap = new Map()

  for (let prop of props) {
    const propValue = gridData[prop]
    if (propValue == null) continue
    if (propValue.uom == null) continue
    if (!Array.isArray(propValue.values)) continue
    if (propValue.values.length === 0) continue

    const valueConverter = UomConverter[propValue.uom]
    if (valueConverter == null) continue

    for (let { value, validTime } of propValue.values) {
      if (value == null || validTime == null) continue

      value = valueConverter(value)
      validTime = dateNormalize(validTime)

      if (value == null || validTime == null) continue

      let timeRecord = timeMap.get(validTime)
      if (timeRecord == null) {
        timeRecord = {}
        timeMap.set(validTime, timeRecord)
      }

      timeRecord[prop] = value
    }
  }

  const resultKeys = Array.from(timeMap.keys()).sort()
  const result = []
  for (let resultKey of resultKeys) {
    let reading = {
      time: dateLocalize(resultKey, timeZone)
    }
    reading = Object.assign(reading, sortObjectProperties(timeMap.get(resultKey)))
    result.push(reading)
  }

  return result
}

function sortObjectProperties (object) {
  const result = {}
  const propNames = Array.from(Object.keys(object)).sort()

  for (let propName of propNames) {
    result[propName] = object[propName]
  }

  return result
}

const UomConverter = {
  'unit:degC': function (value) { // celcius
    return Math.round((value * 9 / 5) + 32) // return fahrenheit
  },

  'unit:degree_(angle)': function (value) {
    return Math.round(value)
  },

  'unit:m': function (value) { // meters
    return Math.round(value * 3.281) // return feet
  },

  'unit:m_s-1': function (value) { // metres per second
    return Math.round(value * 2.237) // return miles per hour
  },

  'unit:mm': function (value) { // millimeters
    return Math.round(value / 25.4) // return inches
  },

  'unit:percent': function (value) {
    return Math.round(value)
  }
}
