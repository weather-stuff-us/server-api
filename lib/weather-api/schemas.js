'use strict'

const Joi = require('joi')

// common bits

const isoDate = Joi.string().length(24)
  .description('a date in ISO format')

const locDate = Joi.string().length(19)
  .description('a date in ISO-like format, but specific to a location')

const timeZone = Joi.string().min(1)
  .description('time zone')

const dow = Joi.number().min(0).max(6)
  .description('the day of the week where 0 is Sunday')

const locationInfo = Joi.object().keys({
  name: Joi.string().min(1).required().description('name of a location'),
  elevationFt: Joi.number().required().description('elevation in feet'),
  lat: Joi.number().required().description('latitude'),
  lon: Joi.number().required().description('longitude'),
  timeZone: Joi.string().min(1).required().description('time zone'),
  office: Joi.string().min(1).required().description('weather office'),
  gridX: Joi.number().required().description('weather office grid x'),
  gridY: Joi.number().required().description('weather office grid y')
}).meta({ name: 'LocationInfo' })

const dateObject = Joi.object().keys({
  isoDate: isoDate.required(),
  locDate: locDate.required(),
  locDay: dow.required(),
  timeZone: timeZone.required()
}).meta({ name: 'Date' }).description('an absolute and location specific date')

// astro info
const astroInfoElement = Joi.object().keys({
  event: Joi.string().min(1).required().description('astronomicon event'),
  value: Joi.number().optional().description('value associated with event'),
  text: Joi.string().min(1).optional().description('textual description of event'),
  date: dateObject
}).meta({ name: 'AstroInfoElement' })

const astroInfo = Joi.object().keys({
  location: locationInfo.required(),
  events: Joi.array().items(astroInfoElement)
}).meta({ name: 'AstroInfo' })

// forecast summary

const forecastSummaryPeriod = Joi.object().keys({
  sTime: dateObject.required(),
  eTime: dateObject.required(),
  name: Joi.string().min(1).required().description('name of the period'),
  isDaytime: Joi.boolean().required().description('whether the period is during the day'),
  temperature: Joi.number().required().description('temperature'),
  temperatureUnit: Joi.string().min(1).required().description('temperature units'),
  temperatureTrend: Joi.any().optional().description('temperature trend'),
  windSpeed: Joi.string().min(1).required().description('wind speed'),
  windDirection: Joi.string().min(1).required().description('wind direction'),
  icon: Joi.string().min(1).required().description('url of weather icon'),
  shortForecast: Joi.string().min(1).required().description('short forecast'),
  detailedForecast: Joi.string().min(1).required().description('detailed forecast')
}).meta({ name: 'ForecastSummaryPeriod' })

const forecastSummary = Joi.object().keys({
  updated: isoDate.required().description('date forecast updated'),
  location: locationInfo.required(),
  periods: Joi.array().items(forecastSummaryPeriod).required()
}).meta({ name: 'ForecastSummary' })

// forecast time series

const forecastTimeSeriesProperty = Joi.object().keys({
  property: Joi.string().min(1).required().description('forecast data property'),
  unit: Joi.string().min(1).required().description('unit of data'),
  data: Joi.array().items(Joi.any()).sparse().required().description('forecast data')
}).meta({ name: 'ForecastTimeSeriesProperty' })

const forecastTimeSeries = Joi.object().keys({
  updated: isoDate.required().description('date forecast updated'),
  location: locationInfo.required(),
  dateStart: locDate.required().description('the date of the start of the forecast'),
  dayStart: dow.required().description('the day of the start of the forecast'),
  properties: Joi.array().items(forecastTimeSeriesProperty).required().description('forecast data')
}).meta({ name: 'ForecastTimeSeries' })

async function validate (object, schema) {
  const options = { abortEarly: true }
  try {
    await Joi.validate(object, schema, options)
  } catch (err) {
    throw new Error(`validation error: ${collectJoiErrors(err)}`)
  }
}

module.exports = {
  astroInfo,
  forecastSummary,
  forecastTimeSeries,
  locationInfo,
  validate
}

function collectJoiErrors (err) {
  return err.details
    .map(detail => detail.message)
    .join('; ')
}
