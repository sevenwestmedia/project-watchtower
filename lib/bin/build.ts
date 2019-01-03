import path from 'path'
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'
import { Logger } from 'typescript-log'
import webpack from 'webpack'
import { BuildConfig, RuntimeConfig } from '../../lib'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import { watchtowerConfigFilename } from '../runtime/config/config'
import { writeFile } from '../runtime/util/fs'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'
import { webpackPromise } from '../util/webpack'
import {
    getMd5,
    setupWithBuildInfo,
    TSCONFIG_VALIDATION_ITEM,
    validateCache,
} from './cache-validator'

export function smp(buildConfig: BuildConfig, webpackConfig: webpack.Configuration) {
    const smpPlugin = new SpeedMeasurePlugin()
    return buildConfig.SMP ? smpPlugin.wrap(webpackConfig) : webpackConfig
}

const buildTarget = async (
    log: Logger,
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment = 'prod',
) => {
    const config = getWebpackConfig(log, buildConfig, target, environment)

    if (!config) {
        return Promise.reject(`Could not load webpack configuration for ${target}/${environment}!`)
    }

    const disableCaching = String(process.env.BUILD_CACHE_DISABLED).toLowerCase() === 'true'
    if (disableCaching) {
        log.info(`Build Caching Disabled... BUILD_CACHE_DISABLED=${disableCaching}`)
    } else if (process.env.NODE_ENV !== 'test' && !disableCaching) {
        const webpackConfigString = JSON.stringify(config)
        const configHash = await getMd5(log, 'webpackConfig', webpackConfigString)

        setupWithBuildInfo(log, {
            buildInfo: {
                environment,
                project: buildConfig.BASE,
                target,
            },
            traceMessages: false, // pwt build doesnt have etrigan
            validationItems: [
                TSCONFIG_VALIDATION_ITEM,
                { isFile: false, itemHash: configHash, hashKey: 'webpackConfig' },
            ],
        })

        await validateCache(log)
    }

    return webpackPromise(log, smp(buildConfig, config)).then(() => {
        const runtimeConfig: RuntimeConfig = {
            ASSETS_PATH: buildConfig.ASSETS_PATH_PREFIX,
            ASSETS_PATH_PREFIX: buildConfig.ASSETS_PATH_PREFIX,
            BASE: '.',
            PUBLIC_PATH: buildConfig.PUBLIC_PATH,
            SERVER_PUBLIC_DIR: buildConfig.SERVER_PUBLIC_DIR === false ? false : 'public/',
        }
        // On success write out watchtower config
        return writeFile(
            log,
            path.join(buildConfig.OUTPUT, watchtowerConfigFilename),
            JSON.stringify(runtimeConfig, undefined, 2),
        )
    })
}

const getBuildEnvironment = (args: BuildParam[]) => {
    for (const arg of args) {
        if (typeof arg !== 'string') {
            continue
        }
        if ((ENVIRONMENTS as string[]).indexOf(arg) !== -1) {
            return arg as BuildEnvironment
        }
    }
    return 'prod'
}

const getBuildTargets = (buildConfig: BuildConfig, args: BuildParam[]) => {
    for (const arg of args) {
        if (!buildConfig.HAS_SERVER && arg === 'server') {
            continue
        }
        if (typeof arg !== 'string') {
            continue
        }
        if ((TARGETS as string[]).indexOf(arg) !== -1) {
            return [arg] as BuildTarget[]
        }
    }

    const defaultTargets = buildConfig.HAS_SERVER ? ['server', 'client'] : ['client']

    return defaultTargets as BuildTarget[]
}

/**
 * Builds one or all targets in a specified environment
 * @param args
 *  [<target>] [<environment>] [-p <project root>]
 *  - target defaults to both server and client
 *  - environment defaults to prod
 *  - p: the root of the build, used for config discovery
 */
const build = async (log: Logger, buildConfig: BuildConfig, ...args: BuildParam[]) => {
    const targets = getBuildTargets(buildConfig, args)
    const environment = getBuildEnvironment(args)

    const cleanTarget = buildConfig.OUTPUT
    await clean(log, cleanTarget)
    for (const target of targets) {
        await buildTarget(log, buildConfig, target, environment)
    }
}

export default build
