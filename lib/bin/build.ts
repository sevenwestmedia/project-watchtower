import cleanBin from './clean'
import lint from './lint'
import test from './test'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import CONFIG from '../config/config'
import { failPromisesLate } from '../util/async'
import { webpackPromise } from '../util/webpack'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'

const { CLIENT_OUTPUT, SERVER_OUTPUT, HAS_SERVER } = CONFIG

const buildTarget = (target: BuildTarget, environment: BuildEnvironment = 'prod') => {
    const config = getWebpackConfig(target, environment)

    if (!config) {
        return Promise.reject(`Could not load webpack configuration for ${target}/${environment}!`)
    }

    return webpackPromise(config)
}

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
        if (!HAS_SERVER && arg === 'server') {
            continue
        }
        if ((TARGETS as string[]).indexOf(arg) !== -1) {
            return [arg] as BuildTarget[]
        }
    }

    const defaultTargets = HAS_SERVER
        ? ['server', 'client']
        : ['client']

    return defaultTargets as BuildTarget[]
}

/**
 * Builds one or all targets in a specified environment
 * @param args
 *  [complete] [<target>] [<environment>]
 *  - target defaults to both server and client
 *  - environment defaults to prod
 *  - complete: runs clean, lint and test before building
 */
const build = async (...args: BuildParam[]) => {
    const targets = getBuildTargets(args)
    const environment = getBuildEnvironment(args)

    if (args.indexOf('complete') !== -1) {
        await cleanBin()
        await lint()
        await test('--silent')
        return failPromisesLate(
            targets.map((target) => buildTarget(target, environment)),
        )
    } else {
        return failPromisesLate(
            targets.map((target) => cleanAndBuild(target, environment)),
        )
    }
}

export default build
