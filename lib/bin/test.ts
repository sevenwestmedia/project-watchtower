import * as path from 'path'
import { forkPromise } from '../__util/process'
import { log, logError } from '../__util/log'

const root = process.cwd()
const jestBin = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')

const test = (...params: string[]) => {
    return forkPromise(jestBin, [
        '--silent',
        '--config',
        'node_modules/project-watchtower/config-templates/jest.json',
        ...params,
    ]).then(() => {
        log('All tests completed successfully.')
    }).catch((e) => {
        logError('The tests finished with an error!')
        throw e
    })
}

export default test
