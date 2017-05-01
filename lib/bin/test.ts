import * as path from 'path'
import { ChildProcess } from 'child_process'
import clean from './clean'
import { forkPromise } from '../util/process'

const root = process.cwd()
const jestBin = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')

/**
 * Runs the jest test runner
 * @param params Jest options
 */
const test = async (...params: string[]): Promise<ChildProcess> => {
    await clean()

    let args: string[] = []

    const debugIndex = params.indexOf('debug')
    const isDebug = debugIndex !== -1

    if (isDebug) {
        params.splice(debugIndex, 1)

        if (params.indexOf('--runInBand') === -1) {
            args.push('--runInBand')
        }
    }

    if (params.indexOf('--config') === -1) {
        args = args.concat([
            '--config',
            isDebug
                ? 'node_modules/project-watchtower/presets/jest/jest-js.json'
                : 'node_modules/project-watchtower/presets/jest/jest.json',
        ])
    }

    const options = isDebug
        ? { execArgv: [ '--debug' ] }
        : {}

    args = args.concat(params)

    return forkPromise(
        jestBin,
        args,
        {
            env: {
                ...process.env,
                NODE_ENV: 'test',
            },
            ...options,
        },
    )
}

export default test
