import test from '../../lib/bin/test'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because tests might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const buildConfig = getConfig(process.cwd())

describe('bin/test', () => {
    it('will test', async () => {
        await test(
            buildConfig,
            '--config',
            'jest.json',
            'math.test.ts', // make sure to not recursively test this file
        )
    })

    it('will test in debug mode', async () => {
        await test(
            buildConfig,
            'debug',
            '--config',
            'jest.json',
            '--testRegex',
            '\\.(spec|test)\\.js$',
            'math.test.js', // make sure to not recursively test this file
        )
    })
})
