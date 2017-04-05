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

    if (params.indexOf('--config') === -1) {
        args = args.concat([
            '--config',
            'node_modules/project-watchtower/config-templates/jest.json',
        ])
    }

    args = args.concat(params)

    return forkPromise(
        jestBin,
        args,
        {
            env: {
                ...process.env,
                NODE_ENV: 'test',
            },
        },
    )
}

export default test
