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
import * as runtimeServerModule from './runtime/server'
import * as universalModule from './runtime/universal'
import * as serverModule from './server'
import * as statsModule from './stats'

import { StartParam, BuildParam, WatchParam, BuildConfig } from './types'

export * from './types'

export type BinPromiseType = (buildConfig: BuildConfig, ...args: string[]) => Promise<any>

export interface BinType {
    build: (buildConfig: BuildConfig, ...args: BuildParam[]) => Promise<any>
    clean: BinPromiseType
    exploreBundle: BinPromiseType
    lint: BinPromiseType
    start: (buildConfig: BuildConfig, ...args: StartParam[]) => Promise<ChildProcess>
    stats: BinPromiseType
    test: BinPromiseType
    watch: (buildConfig: BuildConfig, ...args: WatchParam[]) => Promise<any>
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
export const runtimeServer = runtimeServerModule
export const universal = universalModule
export const server = serverModule
export const stats = statsModule

export { default as clean } from './clean'
