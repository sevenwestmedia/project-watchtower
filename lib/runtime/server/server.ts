import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import { addAssetsToHtml } from './assets'
import { findFreePort } from '../util/network'
import { log, logError } from '../util/log'
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

export const expressNoop: express.RequestHandler = (_res, _req, next) => next()

export const getDefaultHtmlMiddleware = (logNotFound = false) => {
    let indexContent: string

    if (SERVER_PUBLIC_DIR) {
        try {
            const indexPath = path.resolve(SERVER_PUBLIC_DIR, 'index.html')
            indexContent = fs.readFileSync(indexPath, 'utf8')
        } catch (e) {
            if (logNotFound) {
                logError('Reading index.html failed!', e)
            }
            return expressNoop
        }
    }

    const middleware: express.RequestHandler = (_req, res) => {
        const indexWithAssets = addAssetsToHtml(indexContent)
        res
            .status(200)
            .contentType('text/html')
            .send(indexWithAssets)
    }

    return middleware
}

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
        // tslint:disable-next-line no-var-requires
        const { getHotReloadMiddleware } = require('../../server/dev')
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
                // tslint:disable-next-line no-var-requires
                const { openBrowser } = require('../../server/dev')
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
