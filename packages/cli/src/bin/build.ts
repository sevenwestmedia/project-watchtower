import path from 'path'
import webpack from 'webpack'
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'
import {
    BuildConfig,
    RuntimeConfig,
    watchtowerConfigFilename,
    writeFile,
    existsSync,
} from '@project-watchtower/server'

import { Logger } from 'typescript-log'

import { clean } from '../clean/clean'

import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import { BuildEnvironment, BuildTarget, BuildParam } from '..'
import { webpackPromise } from '../utils/webpack'
import { getMd5, setupWithBuildInfo, validateCache, ValidationItem } from './cache-validator'
import { getBabelConfigFile, getTsConfigFile } from '../config/ts-loader-config'

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

        const validationItems: ValidationItem[] = [
            {
                filePath: getTsConfigFile(target, buildConfig),
                hashKey: 'tsconfigHash',
                isFile: true,
            },
            { isFile: false, itemHash: configHash, hashKey: 'webpackConfig' },
        ]

        const yarnLockPath = path.resolve(process.cwd(), 'yarn.lock')
        if (existsSync(yarnLockPath)) {
            validationItems.push({
                filePath: yarnLockPath,
                hashKey: 'yarnLockConfigHash',
                isFile: true,
            })
        }
        const npmLockPath = path.resolve(process.cwd(), 'package-lock.json')
        if (existsSync(npmLockPath)) {
            validationItems.push({
                filePath: npmLockPath,
                hashKey: 'npmLockConfigHash',
                isFile: true,
            })
        }

        const babelConfig = getBabelConfigFile(target, buildConfig)

        if (babelConfig && existsSync(babelConfig)) {
            validationItems.push({
                filePath: babelConfig,
                hashKey: 'babelConfigHash',
                isFile: true,
            })
        }

        setupWithBuildInfo(log, {
            buildInfo: {
                environment,
                project: buildConfig.BASE,
                target,
            },
            traceMessages: false, // pwt build doesnt have etrigan
            validationItems,
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
