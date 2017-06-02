import { ChildProcess } from 'child_process'

import binBuild from './bin/build'
import binClean from './bin/clean'
import binExploreBundle from './bin/explore-bundle'
import binLint from './bin/lint'
import binStart from './bin/start'
import binStats from './bin/stats'
import binTest from './bin/test'
import binWatch from './bin/watch'

import * as buildModule from './build'
import * as configModule from './config'
import * as lintModule from './lint'
import * as runtimeModule from './runtime'
import * as serverModule from './server'
import * as statsModule from './stats'

import { StartParam } from './types'

export * from './types'

export type BinPromiseType = (...args: string[]) => Promise<any>

export interface BinType {
    build: BinPromiseType
    clean: BinPromiseType
    exploreBundle: BinPromiseType
    lint: BinPromiseType
    start: (...args: StartParam[]) => Promise<ChildProcess>
    stats: BinPromiseType
    test: BinPromiseType
    watch: BinPromiseType
}

export const bin: BinType = {
    build: binBuild,
    clean: binClean,
    exploreBundle: binExploreBundle,
    lint: binLint,
    start: binStart,
    stats: binStats,
    test: binTest,
    watch: binWatch,
}

export const build = buildModule
export const config = configModule
export const lint = lintModule
export const runtime = runtimeModule
export const server = serverModule
export const stats = statsModule

export { default as clean } from './clean'
