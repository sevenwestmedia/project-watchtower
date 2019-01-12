import path from 'path'
import { consoleLogger } from 'typescript-log'

import watch from '../../lib/bin/watch'
import { getConfig } from '../../lib/runtime/config/config'
import { waitForConnection } from '../../lib/runtime/util/network'
import { getTestPort } from '../test-helpers'

const testProjectDir = path.join(process.cwd(), './test/test-project')
const log = consoleLogger()
const buildConfig = getConfig(log, testProjectDir)

describe('bin/watch', () => {
    jest.setTimeout(60000)

    it('will watch', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        process.env.TEST_BIN_DIR = path.resolve(process.cwd(), 'dist/cjs/bin')
        let childProcess: any

        try {
            childProcess = await watch(log, buildConfig, {
                NODE_ENV: 'production',
                PROJECT_DIR: testProjectDir,
            })
            await waitForConnection(port)
        } catch (err) {
            if (childProcess) {
                childProcess.kill()
            }
        }
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it('will watch the client', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        let childProcess: any

        try {
            childProcess = await watch(
                log,
                buildConfig,
                {
                    NODE_ENV: 'production',
                    PROJECT_DIR: testProjectDir,
                },
                'client',
            )
            await waitForConnection(port)
        } catch (err) {
            if (childProcess) {
                childProcess.kill()
            }
        }
    })
})
