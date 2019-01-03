import { ChildProcess, fork } from 'child_process'
import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'http'
import proxyMiddleware from 'http-proxy-middleware'
import path from 'path'
import { Logger } from 'typescript-log'
import webpack from 'webpack'
import { BuildConfig } from '../../lib'
import { getWebpackConfig } from '../build/build'
import { getPort } from '../runtime/server/server'
import { findFreePort, waitForConnection } from '../runtime/util/network'
import { getHotReloadMiddleware, openBrowser } from '../server/dev'

const restartServer = (
    buildConfig: BuildConfig,
    port: number,
    projectDir: string,
    oldServer?: ChildProcess,
) => {
    if (oldServer) {
        oldServer.kill()
    }

    // When running in local dev, we have a different process.cwd() than
    // when running in production. This allows static files and such to resolve
    return fork(path.resolve(buildConfig.OUTPUT, 'server.js'), [], {
        env: {
            ...process.env,
            LOAD_DEFAULT_ASSETS: true,
            PORT: port,
            PROJECT_DIR: projectDir,
        },
    })
}

export interface WatchServer {
    app: express.Express
    server: Server
    close: () => void
}

const watchServer = (log: Logger, buildConfig: BuildConfig) =>
    new Promise<WatchServer>(async resolve => {
        dotenv.config({
            path: path.join(buildConfig.BASE, '.env'),
        })

        const hostPort = await findFreePort(getPort(buildConfig.DEV_SERVER_PORT))
        const devServerPort = await findFreePort(hostPort + 1)

        let devServer: ChildProcess
        let devServerAvailable: Promise<any>

        const serverCompiler = webpack(getWebpackConfig(log, buildConfig, 'server', 'dev'))

        serverCompiler.hooks.invalid.tap('invalid', () => {
            log.info('🦄 Server changed, rebuilding and restarting server...⭐')
        })

        const watching = serverCompiler.watch(
            {
                aggregateTimeout: 10000,
            },
            () => {
                if (!devServer) {
                    setTimeout(() => openBrowser(hostPort), 2000)
                }
                devServer = restartServer(buildConfig, devServerPort, buildConfig.BASE, devServer)

                setTimeout(() => {
                    devServerAvailable = waitForConnection(devServerPort)
                }, 100)
            },
        )

        const app = express()

        app.use(getHotReloadMiddleware(log, buildConfig))

        app.use(async (_req, _res, next) => {
            await devServerAvailable
            next()
        })

        app.use(proxyMiddleware('http://localhost:' + devServerPort))

        const server = app.listen(hostPort, () => {
            resolve({
                app,
                close: () => {
                    // tslint:disable-next-line:no-empty
                    watching.close(() => {})
                    server.close()
                },
                server,
            })
        })

        app.set('server', server)
    })

export default watchServer
