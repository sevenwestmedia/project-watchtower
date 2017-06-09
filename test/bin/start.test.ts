import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import start from '../../lib/bin/start'
import { delay } from '../../lib/runtime/util/time'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/start', () => {

    beforeAll(async () => {
        await clean()
        await build()
    })

    it('will start the server', async () => {
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess = await start('watch', 'fast', 'prod', 'debug')
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it.skip('will start the client', async () => {
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess = await start('prod', 'client')
        await waitForConnection(port)
        childProcess.kill()
    })

})
