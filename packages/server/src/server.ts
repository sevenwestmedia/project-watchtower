import express from 'express'
import { Logger } from 'typescript-log'
import { setDefaultAssets } from './assets'
import { getDefaultHtmlMiddleware } from './middleware/default-html-middleware'
import { createEnsureRequestLogMiddleware } from './middleware/ensure-request-log-middleware'
import { getRuntimeConfig, getBuildConfig } from './config/config'
import { isWatchtowerServer, projectDir, isWatchMode } from './environment'
import { findFreePort } from './utils/network'

const isProduction = process.env.NODE_ENV === 'production'

export const getPort = (fallbackPort?: number) => {
    const port = parseInt(process.env.PORT || '', 10) || fallbackPort

    if (!port) {
        throw new Error('No port specified, set one through the PORT environmental variable')
    }

    return port
}

export interface CreateServerOptions {
    log: Logger

    /**
     * Early middleware hook is before static middleswares etc
     */
    earlyMiddlewareHook?: (app: express.Express & { log: Logger }) => void
    middlewareHook?: (app: express.Express & { log: Logger }) => void
    callback?: () => void
    startListening?: boolean
}

export function createServer(options: CreateServerOptions): express.Express {
    const config = getRuntimeConfig(options.log)

    const { earlyMiddlewareHook, middlewareHook, callback, startListening = true } = options
    // To save the user passing the log to both create server and the SSR middleware
    // we make the log available on the app, so when the app is passed through
    // the ssr middleware can access the logger
    const app: express.Express & { log: Logger } = express() as any
    app.log = options.log

    app.disable('x-powered-by')

    if (isWatchtowerServer()) {
        const buildConfig = getBuildConfig(options.log, projectDir() || process.cwd())

        // When running in dev mode, we don't use assets.json so we need to prime
        // the assets location
        setDefaultAssets(buildConfig)
    }

    // buildConfig is used for build time config, for example hot reload, and the PORT
    // in local development. In production the port will come from the environment, not
    // this config object
    if (process.env.NODE_ENV !== 'production' && isWatchMode()) {
        const buildConfig = getBuildConfig(options.log, projectDir() || process.cwd())

        // When running in dev mode, we don't use assets.json so we need to prime
        // the assets location
        setDefaultAssets(buildConfig)

        // tslint:disable-next-line no-var-requires
        const { getHotReloadMiddleware } = require('@project-watchtower/cli')
        app.use(getHotReloadMiddleware(options.log, buildConfig))
    }

    app.use(createEnsureRequestLogMiddleware(options.log))

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
        express.static(config.ASSETS_PATH, {
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
    app.get('*', getDefaultHtmlMiddleware(options.log, config))

    if (!startListening) {
        return app
    }

    const listen = (usePort: number) => {
        const server = app.listen(usePort, () => {
            options.log.info(`Server listening on port ${usePort}`)
            if (process.env.NODE_ENV !== 'production' && isWatchMode()) {
                // tslint:disable-next-line no-var-requires
                const { openBrowser } = require('@project-watchtower/cli')
                openBrowser(options.log, usePort)
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
