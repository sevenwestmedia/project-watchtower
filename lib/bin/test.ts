import * as path from 'path'
import { forkPromise } from '../__util/process'

const root = process.cwd()
const jestBin = path.resolve(root, 'node_modules', 'jest', 'bin', 'jest.js')

const test = (...params: string[]) => {
    return forkPromise(jestBin, [
        '--silent',
        '--config',
        'node_modules/project-watchtower/config-templates/jest.json',
        ...params,
    ])
}

export default test
