import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import { addAssetsToHtml } from './assets'
import { findFreePort } from '../util/network'
import { log, logError } from '../util/log'
import { getConfig } from '../config/config'
import { BuildConfig } from '../../types'
import { getBaseDir } from '../../../lib/runtime/server/base-dir'

const isProduction = process.env.NODE_ENV === 'production'

export const getPort = (buildConfig: BuildConfig, fallbackPort?: number) =>
    parseInt(process.env.PORT || '', 10) || fallbackPort || buildConfig.PORT

export const isWatchMode = () => process.env.START_WATCH_MODE === 'true'

export const isFastMode = () => process.env.START_FAST_MODE === 'true'

export const expressNoop: express.RequestHandler = (_res, _req, next) => next()

export const getDefaultHtmlMiddleware = (buildConfig: BuildConfig, logNotFound = false) => {
    // on production we just serve the generated index.html
    if (isProduction) {
        const indexPath = path.resolve(buildConfig.CLIENT_OUTPUT, 'index.html')
        const productionMiddleware: express.RequestHandler = (_req, res) => {
            res.status(200).sendFile(indexPath)
        }
        return productionMiddleware
    }

    // for development we grab the source index.html and add the assets
    let indexContent: string

    if (buildConfig.SERVER_PUBLIC_DIR) {
        try {
            const indexPath = path.resolve(buildConfig.SERVER_PUBLIC_DIR, 'index.html')
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
    const config = getConfig(getBaseDir())
    const { earlyMiddlewareHook, middlewareHook, callback, startListening = true } = options
    const app = express()
    app.disable('x-powered-by')

    if (process.env.NODE_ENV !== 'production' && isWatchMode()) {
        // tslint:disable-next-line no-var-requires
        const { getHotReloadMiddleware } = require('../../server/dev')
        const buildConfig = getConfig(process.env.PROJECT_DIR || process.cwd())
        app.use(getHotReloadMiddleware(buildConfig))
    }

    if (earlyMiddlewareHook) {
        earlyMiddlewareHook(app)
    }

    // Express route prefixes have to start with /
    const assetsPathPrefixWithLeadingSlash =
        config.ASSETS_PATH_PREFIX[0] === '/'
            ? config.ASSETS_PATH_PREFIX
            : `/${config.ASSETS_PATH_PREFIX}`
    app.use(
        assetsPathPrefixWithLeadingSlash,
        express.static(path.join(config.BASE, config.ASSETS_PATH_PREFIX), {
            index: false,
        }),
    )

    if (config.SERVER_PUBLIC_DIR) {
        app.use(
            express.static(config.SERVER_PUBLIC_DIR, {
                index: false,
            }),
        )
    }

    if (middlewareHook) {
        middlewareHook(app)
    }

    // if the server does not use server-side rendering, just respond with index.html
    // for each request not handled in other middlewares
    app.get('*', getDefaultHtmlMiddleware(config))

    if (!startListening) {
        return app
    }

    const listen = (usePort: number) => {
        const server = app.listen(usePort, () => {
            log(`Server listening on port ${usePort}`)
            if (process.env.NODE_ENV !== 'production' && isWatchMode()) {
                // tslint:disable-next-line no-var-requires
                const { openBrowser } = require('../../server/dev')
                openBrowser(config, usePort)
            }
            if (callback) {
                callback()
            }
        })

        app.set('server', server)
    }

    const port = getPort(config)

    if (isProduction) {
        listen(port)
    } else {
        findFreePort(port).then(usePort => listen(usePort))
    }

    return app
}
