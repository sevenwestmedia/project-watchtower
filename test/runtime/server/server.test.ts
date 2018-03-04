import * as path from 'path'

import { getDefaultHtmlMiddleware, createServer } from '../../../lib/runtime/server/server'
import { getConfig } from '../../../lib/runtime/config/config'
import { createConsoleLogger } from '../../../lib/runtime/universal'

const config = getConfig(__dirname)
config.SERVER_PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'demo', 'public')
const log = createConsoleLogger()

describe('runtime/server/server', () => {
    it('getDefaultHtmlMiddleware', () => {
        getDefaultHtmlMiddleware(log, config)
    })

    it('createServer', () =>
        new Promise(resolve => {
            const app = createServer({
                log,
                callback: () => {
                    app.get('server').close()
                    resolve()
                },
            })
        }))
})
