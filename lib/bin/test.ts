import * as fs from 'fs'
import * as path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../runtime/util/process'

const root = process.cwd()
const jestBin = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')

/**
 * Runs the jest test runner
 * @param params Jest options
 */
const test = async (...params: string[]): Promise<ChildProcess> => {
    let args: string[] = []

    const debugIndex = params.indexOf('debug')
    const isDebug = debugIndex !== -1

    if (isDebug) {
        params.splice(debugIndex, 1)

        if (params.indexOf('--runInBand') === -1) {
            args.push('--runInBand')
        }
    }
    args = appendConfigArgs(args, params, isDebug)

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

function appendConfigArgs(args: string[], params: string[], isDebug: boolean) {
    const configDefined = params.some(param => param.indexOf('--config') === 0)
    if (configDefined) {
        return args
    }

    if (isDebug && fs.existsSync(path.resolve(root, 'jest.debug.config.js'))) {
        return args.concat(['--config', 'jest.debug.config.js'])
    }
    if (fs.existsSync(path.resolve(root, 'jest.config.js'))) {
        return args.concat(['--config', 'jest.config.js'])
    }

    return args.concat([
        '--config',
        isDebug
            ? 'node_modules/project-watchtower/presets/jest/jest-js.json'
            : 'node_modules/project-watchtower/presets/jest/jest.json',
    ])
}

export default test
