'use strict'

module.exports = {
  forLatLon
}

const LruCache = require('lru-cache')

const _ = require('../../lodash')
const urls = require('./urls')
const utils = require('../../utils')
const getJSON = require('../../get-json')

const OfficeGridCache = new LruCache({ max: 500 })

// given lat / lon, return { office, gridX, gridY }
async function forLatLon (lat, lon) {
  const key = cacheKey(lat, lon)
  const officeGrid = OfficeGridCache.get(key)

  if (officeGrid != null) return officeGrid

  const metaDataUrl = await urls.metaData(lat, lon)

  try {
    var metaData = await getJSON(metaDataUrl)
  } catch (err) {
    throw new Error(`error getting office grid for lat/lon: ${err.message}`)
  }

  if (!isMetaDataValid(metaData)) {
    throw new utils.InvalidInputValueError(`invalid location ${lat}, ${lon}`)
  }

  const office = _.get(metaData, 'properties.cwa')
  const gridX = _.get(metaData, 'properties.gridX')
  const gridY = _.get(metaData, 'properties.gridY')

  if (office == null) throw new Error('unable to get office from metaData')
  if (gridX == null) throw new Error('unable to get gridX from metaData')
  if (gridY == null) throw new Error('unable to get gridY from metaData')

  const result = { office, gridX, gridY }
  OfficeGridCache.set(key, result)

  return result
}

function isMetaDataValid (metaData) {
  if (metaData == null) return false

  const properties = metaData.properties
  if (properties == null) return false

  const { cwa, gridX, gridY, forecast, forecastHourly, forecastGridData } = properties

  if (cwa == null) return false
  if (gridX == null) return false
  if (gridY == null) return false
  if (forecast == null) return false
  if (forecastHourly == null) return false
  if (forecastGridData == null) return false

  return true
}

// get the cache key for a lat / lon
function cacheKey (lat, lon) {
  return `${lat},${lon}`
}
