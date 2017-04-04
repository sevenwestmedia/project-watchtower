import * as path from 'path'
import clean from './clean'
import { forkPromise } from '../__util/process'

const root = process.cwd()
const jestBin = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')

/**
 * Runs the jest test runner
 * @param params Jest options
 */
const test = async (...params: string[]) => {
    await clean()
    return forkPromise(
        jestBin,
        [
            '--silent',
            '--config',
            'node_modules/project-watchtower/config-templates/jest.json',
            ...params,
        ],
        {
            env: {
                ...process.env,
                NODE_ENV: 'test',
            },
        },
    )
}

export default test
