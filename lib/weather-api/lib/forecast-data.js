'use strict'

// Transform forecast data from api.weather.gov/gridpoints/Z/X,Y
// into easier to digest data, converting dates to the location's
// local timezone, and units into Amuricun.

module.exports = {
  transform
}

// converts property data like:
//   { [prop]: { uom, values: [{validTime, value}]} }
// into:
//   {
//     properties: [ { property: [prop], unit: String, data: [value, ...] } ],
//     dateStart: 'YYYY-MM-DDTHH:MMSS' // in timezone local time
//     dayStart: day of week (Sun=0)
//   }
// The elements of the `data` array are values for the hours after the dateStart.

const Units = require('../../units')
const PropertiesLib = require('./properties')
const DateTimeRange = require('./date-time-range')
const TzDateTime = require('../../tz-date-time')

const logger = require('../../logger').create(__filename)

// get some collections over the properties
const PropertiesMap = getPropertiesMap()
const PropertyNames = new Set(PropertiesMap.keys())

function transform (gridData, timeZone) {
  if (gridData == null) return null

  // map of property => (map of isoDate.millis => value)
  const propertyDateValueMap = getPropertyDateValueMap(gridData)

  const [ fDateMillis, lDateMillis ] = getFirstLastDateMillis(propertyDateValueMap)

  // convert map of isoDate.millis => value to array of values every hour
  convertPropertyDateValuesToArray(propertyDateValueMap, fDateMillis, lDateMillis)

  const tzDate = TzDateTime.create(new Date(fDateMillis), timeZone)

  // build result object
  const result = {
    dateStart: tzDate.locDate,
    dayStart: tzDate.locDay,
    properties: []
  }

  // add properties
  for (const property of propertyDateValueMap.keys()) {
    const unit = getPropertyUnitCode(property)
    const data = propertyDateValueMap.get(property)

    result.properties.push({ property, unit, data })
  }

  return result
}

// convert map of isoDate.millis => value to array of values every hour
function convertPropertyDateValuesToArray (propertyDateValueMap, fDateMillis, lDateMillis) {
  for (const propertyName of propertyDateValueMap.keys()) {
    const dateValueMap = propertyDateValueMap.get(propertyName)
    const dateValueArray = []
    propertyDateValueMap.set(propertyName, dateValueArray)

    for (let millis = fDateMillis; millis <= lDateMillis; millis += MILLIS_IN_AN_HOUR) {
      dateValueArray.push(dateValueMap.get(millis))
    }

    // remove trailing nulls
    dateValueArray.reverse()
    while (dateValueArray.length > 0 && dateValueArray[0] == null) {
      dateValueArray.shift()
    }
    dateValueArray.reverse()
  }
}

// from a propertyDateValueMap, get the first and last times in millis
function getFirstLastDateMillis (propertyDateValueMap) {
  // get a set of all the dates
  const allIsoMillisSet = new Set()
  for (const dateValueMap of propertyDateValueMap.values()) {
    for (const isoMillis of dateValueMap.keys()) {
      allIsoMillisSet.add(isoMillis)
    }
  }

  const allIsoMillis = Array.from(allIsoMillisSet)

  const fIsoMillis = Math.min(...allIsoMillis)
  const lIsoMillis = Math.max(...allIsoMillis)

  return [ fIsoMillis, lIsoMillis ]
}

// map of property => (map of isoDate.millis => value)
function getPropertyDateValueMap (gridData) {
  const propertyDateValueMap = new Map()

  for (const propertyName of PropertyNames) {
    if (!isValidProperty(gridData, propertyName)) continue

    const dateValueMap = new Map()
    propertyDateValueMap.set(propertyName, dateValueMap)

    const propObject = gridData[propertyName]
    const fromUnit = Units.getUnit(propObject.uom)
    const toUnitCode = getPropertyUnitCode(propertyName)

    for (const { validTime, value } of propObject.values) {
      const dateRange = DateTimeRange.parse(validTime)
      if (dateRange == null) continue

      const convertedValue = fromUnit.convertTo(toUnitCode, value)
      if (convertedValue == null) continue

      for (const date of dateRange) {
        dateValueMap.set(date.getTime(), convertedValue)
      }
    }
  }

  return propertyDateValueMap
}

// return whether property values are as expected
function isValidProperty (gridData, propName) {
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

// get the unit of a property
function getPropertyUnitCode (name) {
  return PropertiesMap.get(name)
}

// get a map of the properties
function getPropertiesMap () {
  const result = new Map()

  const properties = PropertiesLib.getProperties()
  for (const { name, unit } of properties) {
    result.set(name, unit)
  }

  return result
}

const MILLIS_IN_AN_HOUR = 1000 * 60 * 60

// cli tester

if (require.main === module) main()

async function main () {
  let gridData

  const getJSON = require('../../get-json')
  const allGridData = await getJSON('https://api.weather.gov/gridpoints/RAH/67,53')
  gridData = allGridData.properties

  console.log(JSON.stringify(transform(gridData, 'America/New_York')))
}
