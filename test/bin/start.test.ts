import path from 'path'
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
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)

buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binstart')

describe('bin/start', () => {
    beforeAll(async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
    })

    it('will start the server', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess = await start(log, buildConfig, {}, 'watch')
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it('will start the client', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess = await start(log, buildConfig, {}, 'prod', 'client')
        await waitForConnection(port)
        childProcess.kill()
    })
})
