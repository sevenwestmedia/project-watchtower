import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'

const TARGETS = ['server', 'client']
const ENVIRONMENTS = ['dev', 'prod']

const root = process.cwd()

const buildTarget = (target: string, environment: string = 'prod') => {

    if (TARGETS.indexOf(target) === -1) {
        console.error(`Unknown target: "${target}"! `
            + `Known values are: ${TARGETS.join(', ')}`)
        return Promise.reject('')
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        console.error(`Unknown environment: "${environment}"! `
            + `Known values are: ${ENVIRONMENTS.join(', ')}`)
        return Promise.reject('')
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(root, 'config', configFileName)

    let config: webpack.Configuration

    try {
        if (fs.existsSync(customConfigFile + '.js')) {
            config = require(customConfigFile).default
            // tslint:disable-next-line no-console
            console.info('Using custom config file ' + customConfigFile)
        } else {
            // tslint:disable-next-line no-console
            console.info('Building ' + configFileName + '...')
            config = require('../build/config/' + configFileName).default
        }
    } catch (e) {
        console.error('Error loading webpack config!', e)
        return Promise.reject(e)
    }

    const compiler = webpack(config)

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                // tslint:disable-next-line no-console
                console.log(stats.toString())
                resolve()
            }
        })
    })
}

const build = (args: string[]) => {

    if (args.length && ENVIRONMENTS.indexOf(args[0]) !== -1) {
        return Promise.all([
            buildTarget('server', args[0]),
            buildTarget('client', args[0]),
        ])
    } else if (args.length >= 2) {
        return buildTarget(args[0], args[1])
    } else {
        return Promise.all([
            buildTarget('server', 'prod'),
            buildTarget('client', 'prod'),
        ])
    }

}

export default build
