import test from '../../lib/bin/test'

// Increase test timeout because tests might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/test', () => {

    it('will test', async () => {
        await test(
            '--config',
            'jest.json',
            'math.test.ts', // make sure to not recursively test this file
        )
    })

})
