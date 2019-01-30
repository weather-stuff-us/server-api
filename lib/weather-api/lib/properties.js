'use strict'

module.exports = {
  getProperties,
  getProperty
}

const units = require('../../units')

let PropertyIndex = 0
const Properties = new Map()

function getProperties () {
  const result = []

  const keys = Array.from(Properties.keys()).sort()
  for (let key of keys) {
    const value = Properties.get(key)
    const { code } = value.unit

    const name = key
    const unit = code

    result.push({ name, unit })
  }

  return result
}

function getProperty (name) {
  return Properties.get(name)
}

class Property {
  constructor (name, unitCode = null) {
    this._name = name
    this._unit = units.getUnit(unitCode)
    this._index = PropertyIndex

    PropertyIndex++

    if (this._unit == null) {
      throw new Error(`no unit for code "${unitCode}"`)
    }
  }

  get name () { return this._name }
  get unit () { return this._unit }
  get index () { return this._index }
}

addProperty('temperature', 'f')
addProperty('apparentTemperature', 'f')
addProperty('dewpoint', 'f')
addProperty('windChill', 'f')

addProperty('quantitativePrecipitation', 'in')
addProperty('snowfallAmount', 'in')
addProperty('iceAccumulation', 'in')

addProperty('skyCover', 'percent')
addProperty('relativeHumidity', 'percent')
addProperty('probabilityOfPrecipitation', 'percent')

addProperty('windSpeed', 'mph')

function addProperty (name, unitCode) {
  const property = new Property(name, unitCode)
  Properties.set(name, property)
}

// cli tester
if (require.main === module) main()

function main () {
  console.log('properties')
  console.log(JSON.stringify(getProperties(), null, 4))
}
