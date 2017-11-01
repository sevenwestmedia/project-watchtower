import cleanBin from './clean'
import lint from './lint'
import test from './test'
import { ENVIRONMENTS, getWebpackConfig, TARGETS } from '../build/build'
import clean from '../clean'
import { defaultConfig, updateCONFIG } from '../runtime/config/config'
import { failPromisesLate } from '../runtime/util/async'
import { getCustomConfigFile } from '../runtime/util/fs'
import { webpackPromise } from '../util/webpack'
import {
    BuildConfig,
    BuildConfigOverride,
    BuildEnvironment,
    BuildParam,
    BuildTarget,
} from '../types'

const buildTarget = (target: BuildTarget, environment: BuildEnvironment = 'prod') => {
    const webpackConfig = getWebpackConfig(target, environment)

    if (!webpackConfig) {
        return Promise.reject(`Could not load webpack configuration for ${target}/${environment}!`)
    }

    return webpackPromise(webpackConfig)
}

const cleanAndBuild = (
    target: BuildTarget,
    environment: BuildEnvironment = 'prod',
    config: BuildConfig,
) => {
    const cleanTarget = target === 'server' ? config.SERVER_OUTPUT : config.CLIENT_OUTPUT

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

const getBuildTargets = (args: BuildParam[], config: BuildConfig) => {
    for (const arg of args) {
        if (!config.HAS_SERVER && arg === 'server') {
            continue
        }
        if ((TARGETS as string[]).indexOf(arg) !== -1) {
            return [arg] as BuildTarget[]
        }
    }

    const defaultTargets = config.HAS_SERVER ? ['server', 'client'] : ['client']

    return defaultTargets as BuildTarget[]
}

const getBuildConfig = (args: BuildParam[]): BuildConfig => {
    let fileName

    for (const arg of args) {
        if (arg.indexOf('config=') === 0) {
            fileName = arg.slice(7, arg.length)
            continue
        }
    }

    const customConfig = fileName
        ? getCustomConfigFile<BuildConfigOverride>(`config/${fileName}`, {})
        : {}
    const config = {
        ...defaultConfig,
        ...customConfig,
    }

    updateCONFIG(config)

    return config
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
    const config = getBuildConfig(args)
    const targets = getBuildTargets(args, config)
    const environment = getBuildEnvironment(args)

    if (args.indexOf('complete') !== -1) {
        await cleanBin()
        await lint()
        await test('--silent', '--coverage')
        // we have to fail promises late because otherwise the build servers would hang
        // if we exit the process before all webpack builds are completed
        return failPromisesLate(targets.map(target => buildTarget(target, environment)))
    } else {
        return failPromisesLate(targets.map(target => cleanAndBuild(target, environment, config)))
    }
}

export default build
