import * as path from 'path'
import { fork, ChildProcess } from 'child_process'
import * as express from 'express'
import { Server } from 'http'
import * as webpack from 'webpack'
import * as proxyMiddleware from 'http-proxy-middleware'
import * as dotenv from 'dotenv'
import { getWebpackConfig } from '../build/build'
import { openBrowser, getHotReloadMiddleware } from '../server/dev'
import { getPort } from '../runtime/server/server'
import { waitForConnection, findFreePort } from '../runtime/util/network'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const restartServer = (buildConfig: BuildConfig, port: number, oldServer?: ChildProcess) => {
    if (oldServer) {
        oldServer.kill()
    }
    return fork(path.resolve(buildConfig.OUTPUT, 'server.js'), [], {
        env: {
            ...process.env,
            PORT: port,
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
        // When running in local dev, we have a different process.cwd() than
        // when running in production. This allows static files and such to resolve
        process.env.PROJECT_DIR = buildConfig.BASE

        dotenv.config({
            path: path.join(buildConfig.BASE, '.env'),
        })

        const serverPort = getPort(buildConfig.DEV_SERVER_PORT)
        const devServerPort = await findFreePort(serverPort + 1)

        let devServer: ChildProcess
        let devServerAvailable: Promise<any>

        const serverCompiler = webpack(getWebpackConfig(log, buildConfig, 'server', 'dev'))

        const watching = serverCompiler.watch(
            {
                aggregateTimeout: 10000,
            },
            () => {
                if (!devServer) {
                    setTimeout(() => openBrowser(serverPort), 2000)
                }
                devServer = restartServer(buildConfig, devServerPort, devServer)

                setTimeout(() => {
                    devServerAvailable = waitForConnection(serverPort)
                }, 100)
            },
        )

        const app = express()

        app.use(getHotReloadMiddleware(log, buildConfig))

        app.use(async (_req, _res, next) => {
            await devServerAvailable
            next()
        })

        app.use(proxyMiddleware('http://localhost:' + serverPort))

        const server = app.listen(devServerPort, () => {
            resolve({
                app,
                server,
                close: () => {
                    watching.close(() => {})
                    server.close()
                },
            })
        })

        app.set('server', server)
    })

export default watchServer
