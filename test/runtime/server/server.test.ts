import * as path from 'path'

import { getDefaultHtmlMiddleware, createServer } from '../../../lib/runtime/server/server'
import { getConfig } from '../../../lib/runtime/config/config'

const config = getConfig(__dirname)
config.SERVER_PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'demo', 'public')

describe('runtime/server/server', () => {
    it('getDefaultHtmlMiddleware', () => {
        getDefaultHtmlMiddleware(config)
    })

    it('createServer', () =>
        new Promise(resolve => {
            const app = createServer(__dirname, {
                callback: () => {
                    app.get('server').close()
                    resolve()
                },
            })
        }))
})
