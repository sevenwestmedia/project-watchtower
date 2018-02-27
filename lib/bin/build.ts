import cleanBin from './clean'
import lint from './lint'
import test from './test'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import { failPromisesLate } from '../runtime/util/async'
import { webpackPromise } from '../util/webpack'
import { BuildEnvironment, BuildParam, BuildTarget } from '../types'
import { BuildConfig } from '../../lib'

const buildTarget = (
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment = 'prod',
) => {
    const config = getWebpackConfig(buildConfig.BASE, target, environment)

    if (!config) {
        return Promise.reject(`Could not load webpack configuration for ${target}/${environment}!`)
    }

    return webpackPromise(config)
}

const cleanAndBuild = (
    buildConfig: BuildConfig,
    target: BuildTarget,
    environment: BuildEnvironment = 'prod',
) => {
    const cleanTarget = target === 'server' ? buildConfig.SERVER_OUTPUT : buildConfig.CLIENT_OUTPUT

    return clean(cleanTarget).then(() => buildTarget(buildConfig, target, environment))
}

const getBuildEnvironment = (args: BuildParam[]) => {
    for (const arg of args) {
        if (typeof arg !== 'string') {
            continue
        }
        if ((ENVIRONMENTS as string[]).indexOf(arg) !== -1) {
            return arg as BuildEnvironment
        }
    }
    return 'prod'
}

const getBuildTargets = (buildConfig: BuildConfig, args: BuildParam[]) => {
    for (const arg of args) {
        if (!buildConfig.HAS_SERVER && arg === 'server') {
            continue
        }
        if (typeof arg !== 'string') {
            continue
        }
        if ((TARGETS as string[]).indexOf(arg) !== -1) {
            return [arg] as BuildTarget[]
        }
    }

    const defaultTargets = buildConfig.HAS_SERVER ? ['server', 'client'] : ['client']

    return defaultTargets as BuildTarget[]
}

/**
 * Builds one or all targets in a specified environment
 * @param args
 *  [complete] [<target>] [<environment>] [-p <project root>]
 *  - target defaults to both server and client
 *  - environment defaults to prod
 *  - complete: runs clean, lint and test before building
 *  - p: the root of the build, used for config discovery
 */
const build = async (buildConfig: BuildConfig, ...args: BuildParam[]) => {
    const targets = getBuildTargets(buildConfig, args)
    const environment = getBuildEnvironment(args)

    if (args.indexOf('complete') !== -1) {
        await cleanBin(buildConfig)
        await lint(buildConfig)
        await test(buildConfig, '--silent', '--coverage')
        // we have to fail promises late because otherwise the build servers would hang
        // if we exit the process before all webpack builds are completed
        return failPromisesLate(
            targets.map(target => buildTarget(buildConfig, target, environment)),
        )
    } else {
        return failPromisesLate(
            targets.map(target => cleanAndBuild(buildConfig, target, environment)),
        )
    }
}

export default build
