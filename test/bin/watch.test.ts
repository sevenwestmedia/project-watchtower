import path from 'path'
import { consoleLogger } from 'typescript-log'

import { ChildProcess } from 'child_process'
import { bin, WatchServer } from '@project-watchtower/cli'
import { getBuildConfig, waitForConnection } from '@project-watchtower/server'
import { getTestPort } from '../test-helpers'

const testProjectDir = path.join(process.cwd(), './test/test-project')
const log = consoleLogger()
const buildConfig = getBuildConfig(log, testProjectDir)

describe('bin/watch', () => {
    jest.setTimeout(60000)

    it('will watch', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        process.env.TEST_BIN_DIR = path.resolve(process.cwd(), 'dist/cjs/bin')
        let childProcess: ChildProcess | WatchServer | undefined

        try {
            childProcess = await bin.watch(log, buildConfig, {
                NODE_ENV: 'production',
                PROJECT_DIR: testProjectDir,
            })
            await waitForConnection(port)
        } finally {
            if (childProcess) {
                if ('close' in childProcess) {
                    await childProcess.close()
                } else {
                    childProcess.kill()
                }
            }
        }
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    it.skip('will watch the client', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        let childProcess: any

        try {
            childProcess = await bin.watch(
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
