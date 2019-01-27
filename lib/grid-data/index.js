'use strict'

// transform from https://api.weather.gov/gridpoints/abc/x,y3/forecast/hourly
// to a time series: an array of objects {time, [prop1]: val1, ...}

module.exports = {
  getProperties,
  transform
}

const Units = require('../units')
const TzDateTime = require('../tz-date-time')
const Properties = require('./properties')
const dateNormalize = require('../date-normalize')

const logger = require('../logger').create(__filename)

function getProperties () {
  return Properties.getProperties()
}

// convert:
//   { [prop]: { uom, values: [{validTime, value}]} }
// into:
//    [ { dateObject } ]
// where:
//    dateObject      = { date: TzDate, timeValues: [ timeValueObject ]}
//    timeValueObject = { time: TzTime, property: String, value: Object }
function transform (gridData, timeZone) {
  const propNames = Object.keys(gridData)
  const dateMap = new Map()

  for (let propName of propNames) {
    if (!isValidProperty(gridData, propName)) continue

    const property = Properties.getProperty(propName)
    const propValue = gridData[propName]
    const propUnit = Units.getUnit(propValue.uom)

    for (let { value, validTime } of propValue.values) {
      if (value == null || validTime == null) continue

      value = propUnit.convertTo(property.unit.code, value)
      validTime = dateNormalize(validTime)

      const tzDateTime = TzDateTime.create(validTime, timeZone)
      const ymd = tzDateTime.tzDate.ymd
      const hms = tzDateTime.tzTime.hms

      if (!dateMap.has(ymd)) {
        dateMap.set(ymd, { date: tzDateTime.tzDate, timeMap: new Map() })
      }

      const dateObject = dateMap.get(ymd)

      if (!dateObject.timeMap.has(hms)) {
        dateObject.timeMap.set(hms, [])
      }

      const timeProperties = dateObject.timeMap.get(hms)
      timeProperties.push({ property: propName, value })
    }
  }

  const result = []

  const dateKeys = Array.from(dateMap.keys()).sort()
  for (let dateKey of dateKeys) {
    const { date, timeMap } = dateMap.get(dateKey)
    const resultEntry = { date, times: [] }
    result.push(resultEntry)

    const timeKeys = Array.from(timeMap.keys()).sort()
    for (let hms of timeKeys) {
      resultEntry.times.push({ time: hms, properties: timeMap.get(hms) })
    }
  }

  return result
}

function isValidProperty (gridData, propName) {
  const property = Properties.getProperty(propName)
  if (property == null) return false

  const propValue = gridData[propName]
  if (propValue == null) return false

  if (!Array.isArray(propValue.values)) return false
  if (propValue.values.length === 0) return false

  const propUnit = Units.getUnit(propValue.uom)
  if (propUnit == null) {
    logger.warn(`no unit found for ${propName}: ${propValue.uom}`)
    return false
  }

  return true
}

// cli tester
if (require.main === module) main()

function main () {
  const gridData = require('../../test/fixtures/gridpoints.json').properties
  console.log(JSON.stringify(transform(gridData, 'America/New_York')))
}
