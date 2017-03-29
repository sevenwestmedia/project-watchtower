import * as webpack from 'webpack'
import { printWebpackStats } from '../build/util'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../build/clean'
import PATHS from '../build/paths'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'

const { CLIENT_OUTPUT, SERVER_OUTPUT } = PATHS

const buildTarget = (target: BuildTarget, environment: BuildEnvironment = 'prod') => (
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

const cleanAndBuild = (target: BuildTarget, environment: BuildEnvironment = 'prod') => {
    const cleanTarget = target === 'server'
        ? SERVER_OUTPUT
        : CLIENT_OUTPUT

    return clean(cleanTarget).then(() => buildTarget(target, environment))
}

const getBuildEnvironment = (args: BuildParam[]) => {
    for (const arg of args) {
        if ((ENVIRONMENTS as string[]).indexOf(arg) !== -1) {
            return arg as BuildEnvironment
        }
    }
    return 'prod'
}

const getBuildTargets = (args: BuildParam[]) => {
    for (const arg of args) {
        if ((TARGETS as string[]).indexOf(arg) !== -1) {
            return [arg] as BuildTarget[]
        }
    }
    return ['server', 'client'] as BuildTarget[]
}

/**
 * Builds one or all targets in a specified environment
 * @param args
 *  [<target>] [<environment>]
 *  - target defaults to both server and client
 *  - environment defaults to prod
 */
const build = (...args: BuildParam[]) => {
    const targets = getBuildTargets(args)
    const environment = getBuildEnvironment(args)

    return Promise.all(
        targets.map((target) => cleanAndBuild(target, environment)),
    )
}

export default build
