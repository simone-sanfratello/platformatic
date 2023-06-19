'use strict'
const { once } = require('node:events')
const { join } = require('node:path')
const { pathToFileURL } = require('node:url')
const { Worker } = require('node:worker_threads')
const closeWithGrace = require('close-with-grace')
const { loadConfig } = require('@platformatic/service')
const { platformaticRuntime } = require('./config')
const { RuntimeApiClient } = require('./api.js')
const { createDashboard } = require('./dashboard')
const kLoaderFile = pathToFileURL(join(__dirname, 'loader.mjs')).href
const kWorkerFile = join(__dirname, 'worker.js')
const kWorkerExecArgv = [
  '--no-warnings',
  '--experimental-loader',
  kLoaderFile
]

async function start (argv) {
  const { configManager } = await loadConfig({}, argv, platformaticRuntime, {
    watch: true
  })
  const app = await startWithConfig(configManager)

  await app.start()
  return app
}

async function startWithConfig (configManager) {
  const config = configManager.current
  const worker = new Worker(kWorkerFile, {
    /* c8 ignore next */
    execArgv: config.hotReload ? kWorkerExecArgv : [],
    workerData: { config }
  })

  let dashboard = null

  worker.on('exit', () => {
    configManager.fileWatcher?.stopWatching()
    dashboard?.close()
  })

  worker.on('error', () => {
    // the error is logged in the worker
    process.exit(1)
  })

  /* c8 ignore next 3 */
  process.on('SIGUSR2', () => {
    worker.postMessage({ signal: 'SIGUSR2' })
  })

  closeWithGrace((event) => {
    worker.postMessage(event)
  })

  /* c8 ignore next 3 */
  configManager.on('update', () => {
    // TODO(cjihrig): Need to clean up and restart the worker.
  })

  await once(worker, 'message') // plt:init

  const runtimeApiClient = new RuntimeApiClient(worker)

  if (config.dashboard) {
    dashboard = await startDashboard(config.dashboard, runtimeApiClient)
    runtimeApiClient.dashboard = dashboard
  }

  return runtimeApiClient
}

async function startDashboard (dashboardConfig, runtimeApiClient) {
  const { hostname, port, ...config } = dashboardConfig

  try {
    const dashboard = await createDashboard(config, runtimeApiClient)
    await dashboard.listen({
      host: hostname ?? '127.0.0.1',
      port: port ?? 4042
    })
    return dashboard
  /* c8 ignore next 4 */
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = { start, startWithConfig }
