import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import { log, logError } from '../util/log'
import { BuildEnvironment, BuildTarget } from '../types'

export const TARGETS: BuildTarget[] = [
    'server',
    'client',
]

export const ENVIRONMENTS: BuildEnvironment[] = [
    'dev',
    'prod',
    'debug',
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
) => {
    if (TARGETS.indexOf(target) === -1) {
        logError(`Unknown target: "${target}"! `
            + `Known values are: ${TARGETS.join(', ')}`)
        return undefined
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        logError(`Unknown environment: "${environment}"! `
            + `Known values are: ${ENVIRONMENTS.join(', ')}`)
        return undefined
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(root, 'config', configFileName)

    let config: webpack.Configuration

    try {
        if (fs.existsSync(customConfigFile + '.js')) {
            config = require(customConfigFile).default
            log('Using custom config file ' + customConfigFile)
        } else {
            log('Building ' + configFileName + '...')
            config = require('../config/' + configFileName).default
        }

        return config
    } catch (e) {
        logError('Error loading webpack config!', e)
        return undefined
    }
}
