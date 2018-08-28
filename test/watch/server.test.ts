import * as path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import watchServer from '../../lib/watch/server'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'
import { waitForConnection, findFreePort } from '../../lib/runtime/util/network'

const log = createConsoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/server')

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 60000

describe('watch/server', () => {
    it('will run', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        const port = await findFreePort(6000)
        buildConfig.DEV_SERVER_PORT = port
        const watch = await watchServer(log, buildConfig)
        await waitForConnection(port)
        watch.close()
    })
})
