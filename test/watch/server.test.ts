import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import watchServer from '../../lib/watch/server'
import { delay } from '../../lib/util/time'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 60000

describe('watch/server', () => {

    it('will run', async () => {
        await clean()
        await build()
        const port = await getTestPort()
        const watch = await watchServer(port)
        await delay(5000)
        watch.close()
    })

})
