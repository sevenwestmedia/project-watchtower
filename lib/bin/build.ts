import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'

const TARGETS = ['server', 'client']
const ENVIRONMENTS = ['dev', 'prod']

const root = process.cwd()

const buildTarget = (target: string, environment: string = ENVIRONMENTS[0]) => {

    if (TARGETS.indexOf(target) === -1) {
        console.error(`Unknown target: "${target}"! `
            + `Known values are: ${TARGETS.join(', ')}`)
        return
    }

    if (ENVIRONMENTS.indexOf(environment) === -1) {
        console.error(`Unknown environment: "${environment}"! `
            + `Known values are: ${ENVIRONMENTS.join(', ')}`)
        return
    }

    const configFileName = `webpack.${target}.${environment}`
    const customConfigFile = path.resolve(root, 'config', configFileName)

    let config: webpack.Configuration

    if (fs.existsSync(customConfigFile + '.js')) {
        config = require(customConfigFile).default
        // tslint:disable-next-line no-console
        console.info('Using custom config file ' + customConfigFile)
    } else {
        // tslint:disable-next-line no-console
        console.info('Building ' + configFileName + '...')
        config = require('../build/' + configFileName).default
    }

    const compiler = webpack(config)

    compiler.run((err, stats) => {
        if (err) {
            console.error(err)
        } else {
            // tslint:disable-next-line no-console
            console.log(stats.toString())
        }
    })
}

const build = (args: string[]) => {

    if (args.length) {
        buildTarget(args[0], args[1])
    } else {
        buildTarget('server', 'prod')
        buildTarget('client', 'prod')
    }

}

export default build
