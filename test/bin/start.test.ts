import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import start from '../../lib/bin/start'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because builds might take a while
import { createConsoleLogger } from '../../lib/runtime/universal'
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

describe('bin/start', () => {
    beforeAll(async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
    })

    it('will start the server', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()
        const childProcess = await start(
            log,
            buildConfig,
            'watch',
            'fast',
            'prod',
            'debug',
            'inspect',
        )
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it.skip('will start the client', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()
        const childProcess = await start(log, buildConfig, 'prod', 'client')
        await waitForConnection(port)
        childProcess.kill()
    })
})
