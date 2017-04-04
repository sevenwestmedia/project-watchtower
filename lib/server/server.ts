import * as express from 'express'
import { getDefaultHtmlMiddleware, getHotReloadMiddleware, openBrowser } from './dev'
import { findFreePort } from '../__util/network'
import { log } from '../__util/log'
import CONFIG from '../config/config'

const port = parseInt(process.env.PORT || 3000, 10)
const isProduction = process.env.NODE_ENV === 'production'
const watchMode = process.env.START_WATCH_MODE === 'true'

const { SERVER_PUBLIC_DIR } = CONFIG

export type CreateServerType = (
    middlewareHook?: (app: express.Express) => void,
    callback?: () => void,
) => express.Express

export const createServer: CreateServerType = (
    middlewareHook,
    callback,
) => {

    const app = express()

    if (!isProduction && watchMode) {
        app.use(getHotReloadMiddleware())
    }

    if (SERVER_PUBLIC_DIR) {
        app.use(express.static(SERVER_PUBLIC_DIR, {
            index: false,
        }))
    }

    if (middlewareHook) {
        middlewareHook(app)
    }

    app.get('*', getDefaultHtmlMiddleware())

    const listen = (usePort: number) => {
        const server = app.listen(usePort, () => {
            log(`Server listening on port ${usePort}`)
            if (!isProduction && watchMode) {
                openBrowser(port)
            }
            if (callback) {
                callback()
            }
        })

        app.set('server', server)
    }

    if (isProduction) {
        listen(port)
    } else {
        findFreePort(port).then((usePort) => listen(usePort))
    }

    return app
}
