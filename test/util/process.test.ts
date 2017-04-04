import * as path from 'path'
import { expectPromiseToFail } from '../test-helpers'
import { spawnPromise, forkPromise } from '../../lib/util/process'

const processExit = path.resolve(__dirname, '..', '__test-data__', 'process-exit.ts')

describe('util/process', () => {

    it('spawnPromise', () => (
        spawnPromise('node', [
            '-e',
            'process.exit(0)',
        ])
    ))

    it('spawnPromise error', () => (
        expectPromiseToFail(
            spawnPromise('node', [
                '-e',
                'process.exit(1)',
            ]),
        )
    ))

    it('forkPromise', () => (
        forkPromise(processExit, ['0'])
    ))

    it('forkPromise error', () => (
        expectPromiseToFail(
            forkPromise(processExit, ['1']),
        )
    ))

})
