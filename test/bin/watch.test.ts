import watch from '../../lib/bin/watch'
import { delay } from '../../lib/runtime/util/time'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/watch', () => {

    it('will watch', async () => {
        const port = await getTestPort()
        process.env.PORT = port
        const childProcess: any = await watch()
        await delay(1000)
        childProcess.kill()
    })

})
