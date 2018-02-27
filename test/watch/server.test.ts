import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import watchServer from '../../lib/watch/server'
import { delay } from '../../lib/runtime/util/time'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'

const buildConfig = getConfig(process.cwd())

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 60000

describe('watch/server', () => {
    it.skip('will run', async () => {
        await clean(buildConfig)
        await build(buildConfig)
        const port = await getTestPort()
        const watch = await watchServer(buildConfig, port)
        await delay(5000)
        watch.close()
    })
})
