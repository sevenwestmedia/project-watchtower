import path from 'path'
import { bin } from '@project-watchtower/cli'
import { getBuildConfig, waitForConnection } from '@project-watchtower/server'
import { getTestPort } from '../test-helpers'

import { consoleLogger } from 'typescript-log'

const log = consoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getBuildConfig(log, testProjectDir)

buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binstart')

describe('bin/start', () => {
    jest.setTimeout(60000)
    beforeAll(async () => {
        await bin.clean(log, buildConfig)
        await bin.build(log, buildConfig)
    })

    it('will start the server', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess = await bin.start(log, buildConfig, {}, 'watch')
        await waitForConnection(port)
        childProcess.kill()
    })

    // can't test in TypeScript land because it requires the internal server in JavaScript
    // it will fail because it will try to run lib/server/server.js
    // We would need to change __dirname to point at dist/commonjs instead so the file
    // resolves properly.
    // see lib/bin/start.ts:62
    it.skip('will start the client', async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        const childProcess = await bin.start(log, buildConfig, {}, 'prod', 'client')
        if (childProcess.stdout) {
            childProcess.stdout.on('data', data => {
                // eslint-disable-next-line no-console
                console.log(data.toString())
            })
        }
        await waitForConnection(port)
        childProcess.kill()
    })
})
