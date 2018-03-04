import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import watchServer from '../../lib/watch/server'
import { delay } from '../../lib/util/time'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 60000

describe('watch/server', () => {
    it.skip('will run', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        const port = await getTestPort()
        const watch = await watchServer(log, buildConfig, port)
        await delay(5000)
        watch.close()
    })
})
