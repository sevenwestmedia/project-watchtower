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
import { waitForConnection } from '../runtime/util/network'
import { BuildConfig } from '../../lib'

dotenv.config()

const restartServer = (buildConfig: BuildConfig, oldServer?: ChildProcess) => {
    if (oldServer) {
        oldServer.kill()
    }
    return fork(path.resolve(buildConfig.SERVER_OUTPUT, 'server.js'), [], {
        env: process.env,
    })
}

export interface WatchServer {
    app: express.Express
    server: Server
    close: () => void
}

const watchServer = (buildConfig: BuildConfig, port?: number) =>
    new Promise<WatchServer>(resolve => {
        const serverPort = port || getPort(buildConfig)
        const devServerPort = serverPort + 1

        let devServer: ChildProcess
        let devServerAvailable: Promise<any>

        const serverCompiler = webpack(getWebpackConfig(buildConfig.BASE, 'server', 'dev'))

        const watching = serverCompiler.watch(
            {
                aggregateTimeout: 10000,
            },
            () => {
                if (!devServer) {
                    setTimeout(() => openBrowser(buildConfig, devServerPort), 2000)
                }
                devServer = restartServer(buildConfig, devServer)

                setTimeout(() => {
                    devServerAvailable = waitForConnection(serverPort)
                }, 100)
            },
        )

        const app = express()

        app.use(getHotReloadMiddleware(buildConfig))

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
