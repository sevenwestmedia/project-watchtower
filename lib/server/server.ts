import * as express from 'express'
import { getDefaultHtmlMiddleware, getHotReloadMiddleware, openBrowser } from './dev'
import { findFreePort } from '../util/network'
import { log } from '../util/log'
import CONFIG from '../config/config'

const isProduction = process.env.NODE_ENV === 'production'
const { SERVER_PUBLIC_DIR, PORT } = CONFIG

export const getPort = (fallbackPort?: number) => (
    parseInt(process.env.PORT || fallbackPort || PORT, 10)
)

export const isWatchMode = () => (
    process.env.START_WATCH_MODE === 'true'
)

export const isFastMode = () => (
    process.env.START_FAST_MODE === 'true'
)

export type CreateServerType = (
    middlewareHook?: (app: express.Express) => void,
    callback?: () => void,
) => express.Express

export const createServer: CreateServerType = (
    middlewareHook,
    callback,
) => {

    const app = express()

    if (!isProduction && isWatchMode()) {
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
            if (!isProduction && isWatchMode()) {
                openBrowser(usePort)
            }
            if (callback) {
                callback()
            }
        })

        app.set('server', server)
    }

    const port = getPort()

    if (isProduction) {
        listen(port)
    } else {
        findFreePort(port).then((usePort) => listen(usePort))
    }

    return app
}
