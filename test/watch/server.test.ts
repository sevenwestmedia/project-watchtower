import path from 'path'
import { consoleLogger } from 'typescript-log'
import build from '../../lib/bin/build'
import clean from '../../lib/bin/clean'
import { getConfig } from '../../lib/runtime/config/config'
import { findFreePort, waitForConnection } from '../../lib/runtime/util/network'
import watchServer, { WatchServer } from '../../lib/watch/server'

const log = consoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/server')

// Increase test timeout because builds might take a while
jest.setTimeout(60000)

describe('watch/server', () => {
    it('will run', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        const port = await findFreePort(6000)
        buildConfig.DEV_SERVER_PORT = port
        let watch: WatchServer | undefined

        try {
            watch = await watchServer(log, buildConfig)

            await waitForConnection(port)
        } finally {
            if (watch) {
                await watch.close()
            }
        }
    })
})
