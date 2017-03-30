
import binBuild from './bin/build'
import binClean from './bin/clean'
import binExploreBundle from './bin/explore-bundle'
import binLint from './bin/lint'
import binStart from './bin/start'

import * as buildModule from './build'
import * as lintModule from './lint'
import * as serverModule from './server'

export * from './types'

export const bin = {
    build: binBuild,
    clean: binClean,
    exploreBundle: binExploreBundle,
    lint: binLint,
    start: binStart,
}

export const build = buildModule
export const lint = lintModule
export const server = serverModule

export { default as clean } from './clean'
