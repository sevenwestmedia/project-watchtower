import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import start from '../../lib/bin/start'
import { delay } from '../../lib/runtime/util/time'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/start', () => {

    it('will start', async () => {
        await clean()
        await build()
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess = await start('watch', 'fast', 'prod', 'debug')
        await delay()
        childProcess.kill()
    })

})
