import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import { buildCacheDirectory } from '../bin/cache-validator'
import { Logger } from 'typescript-log'

import { clientDebugConfig } from '../config/webpack.client.debug'
import { clientDevConfig } from '../config/webpack.client.dev'
import { clientProdConfig } from '../config/webpack.client.prod'
import { serverDebugConfig } from '../config/webpack.server.debug'
import { serverDevConfig } from '../config/webpack.server.dev'
import { serverProdConfig } from '../config/webpack.server.prod'

import { BuildEnvironment, BuildTarget } from '..'
import { CreateWebpackConfigOptions, CreateWebpackConfig } from '../config'
import { BuildConfig, dynamicRequire } from '@project-watchtower/server'

export const TARGETS: BuildTarget[] = ['server', 'client']

export const ENVIRONMENTS: BuildEnvironment[] = ['dev', 'prod', 'debug']

/**
 * Get the webpack configuration for a given target and environment.
 * This will be the custom configuration if a file is present in
 * config/webpack.<target>.<environment>.js, or the default one otherwise
 */
export function getWebpackConfig(
    log: Logger,
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment,
): webpack.Configuration | undefined {
    const config = getWebpackConfigInternal(log, buildConfig, target, environment)
    // We need to JSON.stringify config, so let's make it safe (as we can)
    if (config && config.plugins) {
        config.plugins.forEach((plugin) => {
            const pluginAny: any = plugin
            if (pluginAny.toJSON) {
                return
            }

            pluginAny.toJSON = () => {
                const ctorName =
                    pluginAny.__proto__ &&
                    pluginAny.__proto__.constructor &&
                    pluginAny.__proto__.constructor.name
                return `Plugin: ${ctorName || pluginAny.toString()}`
            }
        })
    }

    return config
}

function getWebpackConfigInternal(
    log: Logger,
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment,
): webpack.Configuration | undefined {
    if (TARGETS.indexOf(target) === -1) {
        log.error(`Unknown target: "${target}"! ` + `Known values are: ${TARGETS.join(', ')}`)
        return undefined
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        log.error(
            `Unknown environment: "${environment}"! ` +
                `Known values are: ${ENVIRONMENTS.join(', ')}`,
        )
        return undefined
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(buildConfig.BASE, 'config', configFileName)

    const cacheDirectory = buildCacheDirectory({
        environment,
        project: buildConfig.BASE,
        target,
    })

    let config: webpack.Configuration
    const createWebpackConfigOptions: CreateWebpackConfigOptions = {
        buildConfig,
        cacheDirectory,
        log,
    }

    try {
        if (fs.existsSync(customConfigFile + '.js')) {
            // using dynamicRequire to support bundling project-watchtower with webpack
            const customConfig = dynamicRequire(customConfigFile).default
            config =
                typeof customConfig === 'function'
                    ? (customConfig as CreateWebpackConfig)(createWebpackConfigOptions)
                    : customConfig
            log.info('Using custom config file ' + customConfigFile)
        } else {
            log.info('Building ' + configFileName + '...')

            switch (target) {
                case 'server':
                    switch (environment) {
                        case 'dev':
                            return serverDevConfig(createWebpackConfigOptions)

                        case 'debug':
                            return serverDebugConfig(createWebpackConfigOptions)

                        case 'prod':
                            return serverProdConfig(createWebpackConfigOptions)

                        default:
                            throw new Error(`Invalid build target: ${target} ${environment}`)
                    }

                case 'client':
                    switch (environment) {
                        case 'dev':
                            return clientDevConfig(createWebpackConfigOptions)

                        case 'debug':
                            return clientDebugConfig(createWebpackConfigOptions)

                        case 'prod':
                            return clientProdConfig(createWebpackConfigOptions)

                        default:
                            throw new Error(`Invalid build target: ${target} ${environment}`)
                    }

                default:
                    throw new Error(`Invalid build target: ${target} ${environment}`)
            }
        }

        return config
    } catch (err) {
        log.error({ err }, 'Error loading webpack config!')
        return undefined
    }
}
