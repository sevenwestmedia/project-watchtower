import path from 'path'
import { consoleLogger } from 'typescript-log'
import { forkPromise, spawnPromise } from '@project-watchtower/cli'
import { expectPromiseToFail } from '../../test-helpers'

const processExit = path.resolve(__dirname, '..', '..', '__test-data__', 'process-exit.ts')
const log = consoleLogger()

describe('util/process', () => {
    it('spawnPromise', () => spawnPromise(log, 'node', ['-e', 'process.exit(0)']))

    it('spawnPromise error', () =>
        expectPromiseToFail(spawnPromise(log, 'node', ['-e', 'process.exit(1)'])))

    it('forkPromise', () => forkPromise(log, processExit, ['0']))

    it('forkPromise error', () => expectPromiseToFail(forkPromise(log, processExit, ['1'])))
})
