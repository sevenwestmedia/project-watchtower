import * as path from 'path'

import { getDefaultHtmlMiddleware, createServer } from '../../../lib/runtime/server/server'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../../lib/runtime/config/config'
import { createConsoleLogger } from '../../../lib/runtime/universal'
import { getTestPort } from '../../test-helpers'

const log = createConsoleLogger()
const config = getConfig(log, __dirname)
const runtimeConfig = getRuntimeConfigFromBuildConfig(config)

config.SERVER_PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'demo', 'public')
process.env.PROJECT_DIR = process.cwd()

describe('runtime/server/server', () => {
    it('getDefaultHtmlMiddleware', () => {
        getDefaultHtmlMiddleware(log, runtimeConfig)
    })

    it('createServer', async () => {
        process.env.PORT = (await getTestPort()).toString()

        return new Promise(resolve => {
            const app = createServer({
                log,
                callback: () => {
                    app.get('server').close()
                    resolve()
                },
            })
        })
    })
})
