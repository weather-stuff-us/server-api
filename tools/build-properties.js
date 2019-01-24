#!/usr/bin/env node

'use strict'

// generate some code for properties from grid data

const gridData = require('../test/fixtures/gridpoints.json').properties

const skippedProperties = []

const names = Array.from(Object.keys(gridData)).sort()
for (let name of names) {
  const value = gridData[name]
  if (typeof value !== 'object') {
    skippedProperties.push(`${name}: not an object value`)
    continue
  }

  const uom = value.uom || null

  if (uom == null) {
    if (!Array.isArray(value.values)) {
      skippedProperties.push(`${name}: no uom or values`)
      continue
    }
  }

  if (uom == null) {
    console.log(`addProperty('${name}')`)
  } else {
    console.log(`addProperty('${name}', '${uom}')`)
  }
}

for (let skippedProperty of skippedProperties) {
  console.log(`// ${skippedProperty}`)
}
