import watch from '../../lib/bin/watch'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

process.env.NODE_ENV = 'production'

describe('bin/watch', () => {

    it('will watch', async () => {
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess: any = await watch()
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it.skip('will watch the client', async () => {
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess: any = await watch('client')
        await waitForConnection(port)
        childProcess.kill()
    })

})
