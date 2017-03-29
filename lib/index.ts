import binStart from './bin/start'
import binBuild from './bin/build'
import * as buildModule from './build'

export * from './types'

export const bin = {
    start: binStart,
    build: binBuild,
}

export const build = buildModule

export { default as clean } from './clean'
