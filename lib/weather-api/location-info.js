'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const units = require('../units')
const latLon = require('./lib/lat-lon')
const getJSON = require('../get-json')

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const metaDataURL = await urls.metaData(lat, lon)
  const forecastSummaryURL = await urls.forecastSummary(lat, lon)

  try {
    var data = await Promise.all([
      getJSON(metaDataURL),
      getJSON(forecastSummaryURL)
    ])
  } catch (err) {
    throw new Error(`error getting location information: ${err.message}`)
  }

  const [metaData, forecastSummary] = data

  if (metaData == null) throw new Error(`no metaData returned for location information`)
  if (metaData.properties == null) throw new Error(`no metaData properties returned for location information`)

  if (forecastSummary == null) throw new Error(`no forecastSummary returned for location information`)
  if (forecastSummary.properties == null) throw new Error(`no forecastSummary properties returned for location information`)

  return buildResult(metaData.properties, forecastSummary.properties)
}

function buildResult (metaData, forecastSummary) {
  const result = {}

  let relativeLocation = metaData.relativeLocation
  if (relativeLocation == null) throw new Error('metaData does not include relativeLocation')

  relativeLocation = relativeLocation.properties
  if (relativeLocation == null) throw new Error('relativeLocation does not include properties')

  const city = relativeLocation.city || 'Unknownville'
  const state = relativeLocation.state || 'US'

  result.location = `${city}, ${state}`
  result.elevationFt = getElevation(forecastSummary)
  result.timeZone = metaData.timeZone
  result.office = metaData.cwa
  result.gridX = metaData.gridX
  result.gridY = metaData.gridY

  return result
}

function getElevation (forecastSummary) {
  const elevation = forecastSummary.elevation
  if (elevation == null) return undefined
  if (elevation.value == null) return undefined
  if (elevation.unitCode == null) return undefined

  const unit = units.getUnit(elevation.unitCode)
  const value = unit.convertTo('ft', elevation.value)
  if (value == null) return undefined

  return value
}
