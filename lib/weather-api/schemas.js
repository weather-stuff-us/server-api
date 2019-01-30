'use strict'

const Joi = require('joi')

// common bits

const isoDate = Joi.string().length(24)
const locDate = Joi.string().length(19)
const timeZone = Joi.string().min(1)
const dow = Joi.number().min(0).max(6)

const locationInfo = Joi.object().keys({
  name: Joi.string().min(1).required(),
  elevationFt: Joi.number().required(),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  timeZone: Joi.string().min(1).required(),
  office: Joi.string().min(1).required(),
  gridX: Joi.number().required(),
  gridY: Joi.number().required()
})

const dateObject = Joi.object().keys({
  isoDate: isoDate.required(),
  locDate: locDate.required(),
  locDay: dow.required(),
  timeZone: timeZone.required()
})

// astro info
const astroInfoElement = Joi.object().keys({
  event: Joi.string().min(1).required(),
  value: Joi.number().optional(),
  text: Joi.string().min(1).optional(),
  date: dateObject
})

const astroInfo = Joi.object().keys({
  location: locationInfo.required(),
  events: Joi.array().items(astroInfoElement)
})

// forecast summary

const forecastSummaryPeriod = Joi.object().keys({
  sTime: dateObject.required(),
  eTime: dateObject.required(),
  name: Joi.string().min(1).required(),
  isDaytime: Joi.boolean().required(),
  temperature: Joi.number().required(),
  temperatureUnit: Joi.string().min(1).required(),
  temperatureTrend: Joi.any().optional(),
  windSpeed: Joi.string().min(1).required(),
  windDirection: Joi.string().min(1).required(),
  icon: Joi.string().min(1).required(),
  shortForecast: Joi.string().min(1).required(),
  detailedForecast: Joi.string().min(1).required()
})

const forecastSummary = Joi.object().keys({
  updated: isoDate.required(),
  location: locationInfo.required(),
  periods: Joi.array().items(forecastSummaryPeriod).required()
})

// forecast time series

const forecastTimeSeriesProperty = Joi.object().keys({
  property: Joi.string().min(1).required(),
  unit: Joi.string().min(1).required(),
  data: Joi.array().items(Joi.any()).sparse().required()
})

const forecastTimeSeries = Joi.object().keys({
  updated: isoDate.required(),
  location: locationInfo.required(),
  dateStart: locDate.required(),
  dayStart: dow.required(),
  properties: Joi.array().items(forecastTimeSeriesProperty).required()
})

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
