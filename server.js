#!/usr/bin/env node

'use strict'

// set process title early for logger
const pkg = require('./package.json')
process.title = pkg.name

const PORT = process.env.PORT || '3000'

// if invoked as main, call start()
if (require.main === module) setImmediate(start)

const path = require('path')

const helmet = require('helmet')
const express = require('express')
const compression = require('compression')

const httpAPIs = require('./lib/http-apis')

const logger = require('./lib/logger').create(__filename)

let Server

async function start (options) {
  if (Server != null) throw new Error('server already started')

  setupErrorHandlers()

  const app = express()
  app.set('env', 'production')
  app.set('json spaces', 2)

  // see: https://www.npmjs.com/package/helmet
  app.use(helmet({
    frameguard: false
  }))

  // standard sort of health check
  app.use('/_health', (req, res) => {
    res.status(200)
    res.json({ status: 'OK' })
  })

  // APIs
  httpAPIs.mount(app)

  // add compression where needed
  const compressor = compression()

  // mount static web files
  const webDir = path.join(__dirname, 'web')
  app.use('/', compressor, express.static(webDir))

  const leafletDir = path.join(__dirname, 'node_modules', 'leaflet', 'dist')
  app.use('/3rd-party/leaflet', compressor, express.static(leafletDir))

  const d3Dir = path.join(__dirname, 'node_modules', 'd3', 'dist')
  app.use('/3rd-party/d3', compressor, express.static(d3Dir))

  const c3Dir = path.join(__dirname, 'node_modules', 'c3')
  app.use('/3rd-party/c3', compressor, express.static(c3Dir))

  // everything else is a 404
  app.all(/.*/, (req, res) => {
    res.status(404).send({
      error: `not found: '${req.path}'`
    })
  })

  // error handler
  app.use(function errorHandler (err, req, res, next) {
    console.log(`error processing request:`, err)

    // if headers sent, let default express error handler handle it
    if (res.headersSent) return next(err)

    // could come from anywhere, so send 500 w/generic message
    res.status(500).send({ error: 'server error' })
  })

  // start the server
  Server = app.listen(PORT, () => {
    logger.info(`http server is listening at port ${PORT}`)
  })
}

// set up exit handlers
let initializedErrorHandlers = false

function setupErrorHandlers () {
  if (initializedErrorHandlers) return
  initializedErrorHandlers = true

  process.on('exit', (code) => {
    if (code === 0) return

    logger.warn(`server exiting with code: ${code}`)
  })

  process.on('uncaughtException', (err) => {
    logger.error(`uncaught exception: ${err.stack}`)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    if (reason.stack != null) {
      logger.error(`unhandled rejection (err): ${reason.stack}`)
    } else {
      logger.error(`unhandled rejection (other): ${reason}`)
    }

    process.exit(1)
  })

  process.on('SIGINT', signalHandler)
  process.on('SIGTERM', signalHandler)

  function signalHandler (signal) {
    const exitCode = signal === 'SIGTERM' ? 0 : 1
    logger.warn(`received signal ${signal}, shutting down`)
    process.exit(exitCode)
  }
}
