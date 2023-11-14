'use strict'

const { tap, spec } = require('node:test/reporters')
const { run } = require('node:test')
const glob = require('glob').globSync

/* eslint-disable new-cap */
const reporter = process.stdout.isTTY ? new spec() : tap

const files = glob('test/**/*.test.{js,mjs}')

run({
  files,
  concurrency: 10,
  timeout: 30_000
}).compose(reporter).pipe(process.stdout)
