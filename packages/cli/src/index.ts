import { Logger } from 'typescript-log'
import { BuildConfig } from '@project-watchtower/server'

import { ChildProcess } from 'child_process'

import binBuild from './bin/build'
import binClean from './bin/clean'
import binExploreBundle from './bin/explore-bundle'
import binStart from './bin/start'
import binWatch from './bin/watch'

export * from './watch/server'
export * from './build/build'
export * from './clean/clean'
export * from './utils/process'
export * from './utils/webpack'

export type BuildTarget = 'server' | 'client'

export type BuildEnvironment = 'dev' | 'prod' | 'debug'

export type BuildParam = BuildTarget | BuildEnvironment
export type WatchParam = 'server' | 'client'

export type StartParam =
    | 'watch'
    | 'prod'
    | 'debug'
    | 'debug-brk'
    | 'client'
    | '--debug-port'
    | number

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
