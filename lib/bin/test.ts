import * as fs from 'fs'
import * as path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../runtime/util/process'
import { BuildConfig } from '../../lib'

/**
 * Runs the jest test runner
 * @param params Jest options
 */
const test = async (buildConfig: BuildConfig, ...params: string[]): Promise<ChildProcess> => {
    const jestBin = resolveJest(buildConfig.BASE)
    if (!jestBin) {
        throw new Error('Unable to resolve jest')
    }

    let args: string[] = []

    const debugIndex = params.indexOf('debug')
    const isDebug = debugIndex !== -1

    if (isDebug) {
        params.splice(debugIndex, 1)

        if (params.indexOf('--runInBand') === -1) {
            args.push('--runInBand')
        }
    }
    args = appendConfigArgs(buildConfig, args, params, isDebug)

    const options = isDebug ? { execArgv: ['--inspect'] } : {}

    args = args.concat(params)

    return forkPromise(jestBin, args, {
        env: {
            ...process.env,
            NODE_ENV: 'test',
        },
        ...options,
    })
}

function appendConfigArgs(
    buildConfig: BuildConfig,
    args: string[],
    params: string[],
    isDebug: boolean,
) {
    const configDefined = params.some(param => param.indexOf('--config') === 0)
    if (configDefined) {
        return args
    }

    if (isDebug && fs.existsSync(path.resolve(buildConfig.BASE, 'jest.debug.config.js'))) {
        return args.concat(['--config', 'jest.debug.config.js'])
    }
    if (fs.existsSync(path.resolve(buildConfig.BASE, 'jest.config.js'))) {
        return args.concat(['--config', 'jest.config.js'])
    }

    return args.concat([
        '--config',
        isDebug
            ? 'node_modules/project-watchtower/presets/jest/jest-js.json'
            : 'node_modules/project-watchtower/presets/jest/jest.json',
    ])
}

function resolveJest(root: string): string | undefined {
    if (root === '/') {
        return undefined
    }
    const jestPath = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')
    if (fs.existsSync(jestPath)) {
        return jestPath
    }

    return resolveJest(path.resolve(root, '..'))
}

export default test
