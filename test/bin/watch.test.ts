import watch from '../../lib/bin/watch'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because builds might take a while
import { createConsoleLogger } from '../../lib/runtime/universal'
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

process.env.NODE_ENV = 'production'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

describe('bin/watch', () => {
    it('will watch', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()
        const childProcess: any = await watch(log, buildConfig)
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it('will watch the client', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()
        const childProcess: any = await watch(log, buildConfig, 'client')
        await waitForConnection(port)
        childProcess.kill()
    })
})
