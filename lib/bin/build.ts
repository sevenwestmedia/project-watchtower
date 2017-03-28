import * as webpack from 'webpack'
import { printWebpackStats } from '../build/util'
import { ENVIRONMENTS, getWebpackConfig } from '../build/build'

const buildTarget = (target: string, environment: string = 'prod') => (
    new Promise((resolve, reject) => {
        const config = getWebpackConfig(target, environment)

        if (!config) {
            return reject(`Could not load webpack configuration for ${target}/${environment}!`)
        }

        const compiler = webpack(config)

        compiler.run((err, stats) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                printWebpackStats(stats)
                resolve()
            }
        })
    })
)

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
