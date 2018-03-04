import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import { dynamicRequire } from '../runtime/util/fs'
import { log, logError } from '../util/log'
import { BuildEnvironment, BuildTarget } from '../types'
import webpackClientDevConfig from '../config/webpack.client.dev'
import webpackClientDebugConfig from '../config/webpack.client.debug'
import webpackClientProdConfig from '../config/webpack.client.prod'
import webpackServerDevConfig from '../config/webpack.server.dev'
import webpackServerDebugConfig from '../config/webpack.server.debug'
import webpackServerProdConfig from '../config/webpack.server.prod'
import { BuildConfig } from '../index'

export const TARGETS: BuildTarget[] = ['server', 'client']

export const ENVIRONMENTS: BuildEnvironment[] = ['dev', 'prod', 'debug']

/**
 * Get the webpack configuration for a given target and environment.
 * This will be the custom configuration if a file is present in
 * config/webpack.<target>.<environment>.js, or the default one otherwise
 */
export const getWebpackConfig = (
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment,
): webpack.Configuration | undefined => {
    if (TARGETS.indexOf(target) === -1) {
        logError(`Unknown target: "${target}"! ` + `Known values are: ${TARGETS.join(', ')}`)
        return undefined
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        logError(
            `Unknown environment: "${environment}"! ` +
                `Known values are: ${ENVIRONMENTS.join(', ')}`,
        )
        return undefined
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(buildConfig.BASE, 'config', configFileName)

    let config: webpack.Configuration

    try {
        if (fs.existsSync(customConfigFile + '.js')) {
            // using dynamicRequire to support bundling project-watchtower with webpack
            config = dynamicRequire(customConfigFile).default
            log('Using custom config file ' + customConfigFile)
        } else {
            log('Building ' + configFileName + '...')

            switch (target) {
                case 'server':
                    switch (environment) {
                        case 'dev':
                            return webpackServerDevConfig(buildConfig)

                        case 'debug':
                            return webpackServerDebugConfig(buildConfig)

                        case 'prod':
                            return webpackServerProdConfig(buildConfig)

                        default:
                            throw new Error(`Invalid build target: ${target} ${environment}`)
                    }

                case 'client':
                    switch (environment) {
                        case 'dev':
                            return webpackClientDevConfig(buildConfig)

                        case 'debug':
                            return webpackClientDebugConfig(buildConfig)

                        case 'prod':
                            return webpackClientProdConfig(buildConfig)

                        default:
                            throw new Error(`Invalid build target: ${target} ${environment}`)
                    }

                default:
                    throw new Error(`Invalid build target: ${target} ${environment}`)
            }
        }

        return config
    } catch (e) {
        logError('Error loading webpack config!', e)
        return undefined
    }
}
