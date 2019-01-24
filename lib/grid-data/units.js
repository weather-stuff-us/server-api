'use strict'

// converters between various units; unit codes from:
// http://codes.wmo.int/common/unit

module.exports = {
  getUnit
}

const logger = require('../logger').create(__filename)

// return the Unit object for a given a unit code
function getUnit (unitCode = null) {
  if (unitCode != null) unitCode = unitCode.replace(/^unit:/, '')
  return Units.get(unitCode)
}

const Units = new Map()

// a self-descriptive unit object that can convert to other units
class Unit {
  constructor (code, suffix, name) {
    this._converters = new Map()
    this._code = code
    this._suffix = suffix
    this._name = name
  }

  // accessors for code/name properties
  get code () { return this._code }
  get suffix () { return this._suffix }
  get name () { return this._name }

  // convert a value from this to unit to another
  convertTo (toUnitCode, value) {
    if (toUnitCode === this.code) return value

    const converter = this._converters.get(toUnitCode)
    if (converter == null) {
      logger.warn(`no converter from ${this.code} to ${toUnitCode}`)
      return null
    }

    return converter(value)
  }

  // add a converter
  addConverterTo (toUnitCode, fn) {
    if (this._converters.has(toUnitCode)) {
      logger.error(`unit ${this.code} already has converter to ${toUnitCode}`)
      return
    }
    return this._converters.set(toUnitCode, fn)
  }
}

// units from weather service
addUnit(null, '', 'null')
addUnit('null', '', 'null')
addUnit('degC', '°C', 'degrees Celsius')
addUnit('degree_(angle)', '°', 'degrees')
addUnit('m', 'm', 'meters')
addUnit('m_s-1', 'mps', 'meters per second')
addUnit('mm', 'mm', 'millimetres')
addUnit('percent', '%', 'percent')

// units to convert to
addUnit('degF', '°F', 'degrees Fahrenheit')
addUnit('compass', '', 'compass point')
addUnit('ft', 'ft', 'feet')
addUnit('mi', 'mi', 'miles')
addUnit('mi_h', 'mph', 'miles per hour')
addUnit('in', 'in', 'inches')

// add converters
addConverter(null, 'null', value => value)
addConverter('null', null, value => value)
addConverter('degC', 'degF', value => round((value * 9 / 5) + 32))
addConverter('degree_(angle)', 'compass', degreesToCompass)
addConverter('m', 'ft', value => round(value * 3.28084, 1))
addConverter('m', 'mi', value => round(value / 1609.34), 1)
addConverter('m_s-1', 'mi_h', value => round(value * 2.23694))
addConverter('mm', 'in', value => round(value / 25.4, 2))

function round (number, decimals = 0) {
  if (decimals === 0) return Math.round(number)

  const scalar = Math.pow(10, decimals)
  return Math.round(number * scalar) / scalar
}

function degreesToCompass (degrees) {
  degrees += 22.5

  if (degrees < 45) return 'N'
  if (degrees < 90) return 'NE'
  if (degrees < 135) return 'E'
  if (degrees < 180) return 'SE'
  if (degrees < 225) return 'S'
  if (degrees < 270) return 'SW'
  if (degrees < 315) return 'W'
  if (degrees < 360) return 'NW'
  return 'N'
}

// adds a new unit
function addUnit (code, suffix, name) {
  if (Units.has(code)) {
    throw new Error(`unit already added: ${code}`)
  }

  Units.set(code, new Unit(code, suffix, name))
}

// adds a new converter
function addConverter (fromCode, toCode, fn) {
  if (!Units.has(fromCode)) {
    throw new Error(`unit not available: ${fromCode}`)
  }

  Units.get(fromCode).addConverterTo(toCode, fn)
}

// cli tester
if (require.main === module) main()

function main () {
  convertIt(1, 'm', 'ft')
  convertIt(1, null, 'null')
  convertIt(0, 'degree_(angle)', 'compass')
  convertIt(45, 'degree_(angle)', 'compass')
  convertIt(90, 'degree_(angle)', 'compass')
  convertIt(315, 'degree_(angle)', 'compass')
  convertIt(359, 'degree_(angle)', 'compass')
}

function convertIt (value, fromCode, toCode) {
  const fromUnit = getUnit(fromCode)
  const toUnit = getUnit(toCode)
  const converted = fromUnit.convertTo(toUnit.code, value)
  console.log(`${value}${fromUnit.suffix} == ${converted}${toUnit.suffix}`)
}
