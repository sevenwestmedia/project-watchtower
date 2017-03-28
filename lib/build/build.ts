import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'

export const TARGETS = ['server', 'client']
export const ENVIRONMENTS = ['dev', 'prod', 'base']

const root = process.cwd()

export const getWebpackConfig = (target: string, environment: string, forceDefault = false) => {
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

export const getDefaultWebpackConfig = (target: string, environment: string) => (
    getWebpackConfig(target, environment, true)
)
