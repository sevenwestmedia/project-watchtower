import fs from 'fs'
import path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../util/process'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/**
 * Runs the jest test runner
 * @param params [--debug] [--debug-brk] [--port debugPort] [...Jest options]
 */
async function test(
    log: Logger,
    buildConfig: BuildConfig,
    ...params: string[]
): Promise<ChildProcess> {
    const jestBin = resolveJest(buildConfig.BASE)
    if (!jestBin) {
        throw new Error('Unable to resolve jest')
    }

    let args: string[] = []

    const debugIndex = params.indexOf('debug')
    const debugBrkIndex = params.indexOf('debug-brk')
    let port = 5858
    const isDebug = debugIndex !== -1
    const isDebugBrk = debugBrkIndex !== -1

    if (isDebug || isDebugBrk) {
        if (isDebug) {
            params.splice(debugIndex, 1)
        }
        if (isDebugBrk) {
            params.splice(debugBrkIndex, 1)
        }
        const portIndex = params.indexOf('--port')
        if (portIndex !== -1) {
            port = Number(params[portIndex + 1])
            params.splice(portIndex, 2)
        }

        if (params.indexOf('--runInBand') === -1) {
            args.push('--runInBand')
        }
    }
    args = appendConfigArgs(buildConfig, args, params, isDebug || isDebugBrk)

    const options = isDebug
        ? { execArgv: [`--inspect=${port}`] }
        : isDebugBrk
            ? { execArgv: [`--inspect-brk=${port}`] }
            : {}

    args = args.concat(params)

    return forkPromise(log, jestBin, args, {
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
    if (isDebug && fs.existsSync(path.resolve(buildConfig.BASE, 'jest.debug.config.json'))) {
        return args.concat(['--config', 'jest.debug.config.json'])
    }
    if (fs.existsSync(path.resolve(buildConfig.BASE, 'jest.config.js'))) {
        return args.concat(['--config', 'jest.config.js'])
    }

    return args.concat(['--config', path.resolve(__dirname, '../../presets/jest/jest.json')])
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
