import path from 'path'
import { consoleLogger } from 'typescript-log'
import { bin, watchServer, WatchServer } from '@project-watchtower/cli'
import { getBuildConfig, findFreePort, waitForConnection } from '@project-watchtower/server'

const log = consoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getBuildConfig(log, testProjectDir)
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/server')

// Increase test timeout because builds might take a while
jest.setTimeout(60000)

describe.skip('watch/server', () => {
    it('will run', async () => {
        await bin.clean(log, buildConfig)
        await bin.build(log, buildConfig)
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
