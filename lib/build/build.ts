import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import { BuildEnvironment, BuildTarget } from '../types'

export const TARGETS: BuildTarget[] = [
    'server',
    'client',
]

export const ENVIRONMENTS: BuildEnvironment[] = [
    'dev',
    'prod',
    'base',
]

const root = process.cwd()

/**
 * Get the webpack configuration for a given target and environment.
 * This will be the custom configuration if a file is present in
 * config/webpack.<target>.<environment>.js, or the default one otherwise
 */
export const getWebpackConfig = (
    target: BuildTarget,
    environment: BuildEnvironment,
    forceDefault = false,
) => {
    if (TARGETS.indexOf(target) === -1) {
        console.error(`Unknown target: "${target}"! `
            + `Known values are: ${TARGETS.join(', ')}`)
        return undefined
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        console.error(`Unknown environment: "${environment}"! `
            + `Known values are: ${ENVIRONMENTS.join(', ')}`)
        return undefined
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(root, 'config', configFileName)

    let config: webpack.Configuration

    try {
        if (!forceDefault && fs.existsSync(customConfigFile + '.js')) {
            config = require(customConfigFile).default
            // tslint:disable-next-line no-console
            console.info('Using custom config file ' + customConfigFile)
        } else {
            // tslint:disable-next-line no-console
            console.info('Building ' + configFileName + '...')
            config = require('./config/' + configFileName).default
        }

        return config
    } catch (e) {
        console.error('Error loading webpack config!', e)
        return undefined
    }
}

/**
 * Get the default webpack configuration for a given target and environment.
 * Use this to create a custom configuration that extends the default one.
 */
export const getDefaultWebpackConfig = (target: BuildTarget, environment: BuildEnvironment) => (
    getWebpackConfig(target, environment, true)
)
