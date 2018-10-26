import path from 'path'
import cleanBin from './clean'
import lint from './lint'
import test from './test'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import { failPromisesLate } from '../util/async'
import { webpackPromise } from '../util/webpack'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'
import { BuildConfig, RuntimeConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import { writeFile } from '../runtime/util/fs'
import { watchtowerConfigFilename } from '../runtime/config/config'
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'
import webpack from 'webpack'
import {
    validateCache,
    getMd5,
    setupWithBuildInfo,
    TSCONFIG_VALIDATION_ITEM,
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
            validationItems: [
                TSCONFIG_VALIDATION_ITEM,
                { isFile: false, itemHash: configHash, hashKey: 'webpackConfig' },
            ],
            buildInfo: {
                project: buildConfig.BASE,
                environment,
                target,
            },
            traceMessages: false, // pwt build doesnt have etrigan
        })

        await validateCache(log)
    }

    return webpackPromise(log, smp(buildConfig, config)).then(() => {
        const runtimeConfig: RuntimeConfig = {
            BASE: '.',
            ASSETS_PATH: buildConfig.ASSETS_PATH_PREFIX,
            ASSETS_PATH_PREFIX: buildConfig.ASSETS_PATH_PREFIX,
            SERVER_PUBLIC_DIR: buildConfig.SERVER_PUBLIC_DIR === false ? false : 'public/',
            PUBLIC_PATH: buildConfig.PUBLIC_PATH,
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
 *  [complete] [<target>] [<environment>] [-p <project root>]
 *  - target defaults to both server and client
 *  - environment defaults to prod
 *  - complete: runs clean, lint and test before building
 *  - p: the root of the build, used for config discovery
 */
const build = async (log: Logger, buildConfig: BuildConfig, ...args: BuildParam[]) => {
    const targets = getBuildTargets(buildConfig, args)
    const environment = getBuildEnvironment(args)

    if (args.indexOf('complete') !== -1) {
        await cleanBin(log, buildConfig)
        await lint(log, buildConfig)
        await test(log, buildConfig, '--silent', '--coverage')
        // we have to fail promises late because otherwise the build servers would hang
        // if we exit the process before all webpack builds are completed
        return failPromisesLate(
            log,
            targets.map(target => buildTarget(log, buildConfig, target, environment)),
        )
    } else {
        const cleanTarget = buildConfig.OUTPUT
        await clean(log, cleanTarget)
        for (const target of targets) {
            await buildTarget(log, buildConfig, target, environment)
        }
    }
}

export default build
