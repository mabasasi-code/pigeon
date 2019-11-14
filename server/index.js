const express = require('express')
const proxy = require('http-proxy-middleware')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const config = require('../nuxt.config.js')
const database = require('../models').default
const batch = require('../src/cron').default
const routes = require('./routes')

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Connection Database
  // eslint-disable-next-line no-unused-vars
  const conn = await database()

  // Import API routes or Proxy
  if (process.env.USE_PROXY) {
    const apiProxy = proxy({
      target: process.env.API_PROXY_URL,
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
      ws: true,
      logLevel: process.env.CONSOLA_LEVEL
    })
    app.use('/api', apiProxy)
  } else {
    app.use('/api', routes)
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // Awake batch scheduler
  if (process.env.RUN_BATCH === 'true') {
    await batch()
    consola.ready({
      message: 'Run update batch',
      badge: true
    })
  }
}

start()
