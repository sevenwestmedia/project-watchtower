import test from '../../lib/bin/test'

// Increase test timeout because tests might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/test', () => {
    it('will test', async () => {
        await test(
            '--config',
            'jest.json',
            'math.test.ts', // make sure to not recursively test this file
        )
    })

    it('will test in debug mode', async () => {
        await test(
            'debug',
            '--config',
            'jest.json',
            'math.test.js', // make sure to not recursively test this file
        )
    })
})
