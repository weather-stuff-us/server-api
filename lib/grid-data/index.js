'use strict'

// transform from https://api.weather.gov/gridpoints/abc/x,y3/forecast/hourly
// to a time series: an array of objects {time, [prop1]: val1, ...}

module.exports = {
  getProperties,
  transform
}

const Units = require('./units')
const Properties = require('./properties')
const dateNormalize = require('../date-normalize')

const logger = require('../logger').create(__filename)

function getProperties () {
  return Properties.getProperties()
}

// convert
//   { [prop]: {uom, values: [{validTime, value}]} }
// into
//    {[time]: { [prop]: value }}
function transform (gridData) {
  const propNames = Object.keys(gridData)
  const timeMap = new Map()

  for (let propName of propNames) {
    const property = Properties.getProperty(propName)
    if (property == null) continue

    const propValue = gridData[propName]
    if (propValue == null) continue

    if (!Array.isArray(propValue.values)) continue
    if (propValue.values.length === 0) continue

    const propUnit = Units.getUnit(propValue.uom)
    if (propUnit == null) {
      logger.warn(`no unit found for ${propName}: ${propValue.uom}`)
      continue
    }

    for (let { value, validTime } of propValue.values) {
      if (value == null || validTime == null) continue

      value = propUnit.convertTo(property.unit.code, value)
      validTime = dateNormalize(validTime)

      if (value == null || validTime == null) continue

      let timeRecord = timeMap.get(validTime)
      if (timeRecord == null) {
        timeRecord = {}
        timeMap.set(validTime, timeRecord)
      }

      timeRecord[propName] = value
    }
  }

  const resultKeys = Array.from(timeMap.keys()).sort()
  const result = {}
  for (let resultKey of resultKeys) {
    result[resultKey] = sortObjectProperties(timeMap.get(resultKey))
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

// cli tester
if (require.main === module) main()

function main () {
  const gridData = require('../../test/fixtures/gridpoints.json').properties
  console.log(JSON.stringify(transform(gridData), null, 4))
}
