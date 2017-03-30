import * as webpack from 'webpack'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import CONFIG from '../build/config/config'
import { logError } from '../__util/log'
import { printWebpackStats } from '../__util/webpack'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'

const { CLIENT_OUTPUT, SERVER_OUTPUT } = CONFIG

const buildTarget = (target: BuildTarget, environment: BuildEnvironment = 'prod') => (
    new Promise((resolve, reject) => {
        const config = getWebpackConfig(target, environment)

        if (!config) {
            return reject(`Could not load webpack configuration for ${target}/${environment}!`)
        }

        const compiler = webpack(config)

        compiler.run((err, stats) => {
            if (err) {
                logError(err)
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
    ).catch((e) => {
        throw e
    })
}

export default build
