import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import watchServer from '../../lib/watch/server'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'
import { waitForConnection } from '../../lib/runtime/util/network'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 60000

describe('watch/server', () => {
    it('will run', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const watch = await watchServer(log, buildConfig)
        await waitForConnection(port)
        watch.close()
    })
})
