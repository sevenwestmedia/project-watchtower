import { ChildProcess } from 'child_process'

import binBuild from './bin/build'
import binClean from './bin/clean'
import binExploreBundle from './bin/explore-bundle'
import binStart from './bin/start'
import binWatch from './bin/watch'

import * as buildModule from './build'
import * as configModule from './config'
import * as runtimeServerModule from './runtime/server'
import * as universalModule from './runtime/universal'
import * as serverModule from './server'

import { Logger } from 'typescript-log'
import { BuildConfig } from './runtime/server'
import { BuildParam, StartParam, WatchParam } from './types'

export * from './types'

export type BinPromiseType = (
    log: Logger,
    buildConfig: BuildConfig,
    ...args: string[]
) => Promise<any>

export interface BinType {
    build: (log: Logger, buildConfig: BuildConfig, ...args: BuildParam[]) => Promise<any>
    clean: BinPromiseType
    exploreBundle: BinPromiseType
    start: (
        log: Logger,
        buildConfig: BuildConfig,
        startEnv: NodeJS.ProcessEnv,
        ...args: StartParam[]
    ) => Promise<ChildProcess>
    watch: (
        log: Logger,
        buildConfig: BuildConfig,
        watchProcessEnv: NodeJS.ProcessEnv,
        ...args: WatchParam[]
    ) => Promise<any>
}

export const bin: BinType = {
    build: binBuild,
    clean: binClean,
    exploreBundle: binExploreBundle,
    start: binStart,
    watch: binWatch,
}

export const build = buildModule
export const config = configModule
export const runtimeServer = runtimeServerModule
export const universal = universalModule
export const server = serverModule

export { default as clean } from './clean'
