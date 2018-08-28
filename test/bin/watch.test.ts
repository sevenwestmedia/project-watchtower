import watch from '../../lib/bin/watch'
import * as path from 'path'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because builds might take a while
import { createConsoleLogger } from '../../lib/runtime/universal'
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const testProjectDir = path.join(process.cwd(), './test/test-project')
const log = createConsoleLogger()
const buildConfig = getConfig(log, testProjectDir)

describe('bin/watch', () => {
    it('will watch', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess: any = await watch(log, buildConfig, {
            NODE_ENV: 'production',
            PROJECT_DIR: testProjectDir,
        })
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it('will watch the client', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess: any = await watch(
            log,
            buildConfig,
            {
                NODE_ENV: 'production',
                PROJECT_DIR: testProjectDir,
            },
            'client',
        )
        await waitForConnection(port)
        childProcess.kill()
    })
})
