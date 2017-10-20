import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import { addAssetsToHtml } from './assets'
import { findFreePort } from '../util/network'
import { log, logError } from '../util/log'
import CONFIG from '../config/config'

const isProduction = process.env.NODE_ENV === 'production'
const { CLIENT_OUTPUT, PORT, SERVER_PUBLIC_DIR } = CONFIG

export const getPort = (fallbackPort?: number) =>
    parseInt(process.env.PORT || '', 10) || fallbackPort || PORT

export const isWatchMode = () => process.env.START_WATCH_MODE === 'true'

export const isFastMode = () => process.env.START_FAST_MODE === 'true'

export const expressNoop: express.RequestHandler = (_res, _req, next) => next()

export const getDefaultHtmlMiddleware = (logNotFound = false) => {
    // on production we just serve the generated index.html
    if (isProduction) {
        const indexPath = path.resolve(CLIENT_OUTPUT, 'index.html')
        const productionMiddleware: express.RequestHandler = (_req, res) => {
            res.status(200).sendFile(indexPath)
        }
        return productionMiddleware
    }

    // for development we grab the source index.html and add the assets
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
    } else {
        return expressNoop
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

export type CreateServerOptions = {
    /** Early middleware hook is before static middleswares etc */
    earlyMiddlewareHook?: (app: express.Express) => void
    middlewareHook?: (app: express.Express) => void
    callback?: () => void
    startListening?: boolean
}
export type CreateServerType = (options?: CreateServerOptions) => express.Express

const defaultOptions: CreateServerOptions = {}
export const createServer: CreateServerType = (options = defaultOptions) => {
    const { earlyMiddlewareHook, middlewareHook, callback, startListening = true } = options
    const app = express()
    app.disable('x-powered-by')

    if (!isProduction && isWatchMode()) {
        // tslint:disable-next-line no-var-requires
        const { getHotReloadMiddleware } = require('../../server/dev')
        app.use(getHotReloadMiddleware())
    }

    if (earlyMiddlewareHook) {
        earlyMiddlewareHook(app)
    }

    app.use(
        express.static(CLIENT_OUTPUT, {
            index: false,
        }),
    )

    if (SERVER_PUBLIC_DIR) {
        app.use(
            express.static(SERVER_PUBLIC_DIR, {
                index: false,
            }),
        )
    }

    if (middlewareHook) {
        middlewareHook(app)
    }

    // if the server does not use server-side rendering, just respond with index.html
    // for each request not handled in other middlewares
    app.get('*', getDefaultHtmlMiddleware())

    if (!startListening) {
        return app
    }

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
        findFreePort(port).then(usePort => listen(usePort))
    }

    return app
}
