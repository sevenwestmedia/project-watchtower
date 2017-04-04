import build from '../../lib/bin/build'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/build', () => {

    it('build', async () => {
        await build()
    })

})
