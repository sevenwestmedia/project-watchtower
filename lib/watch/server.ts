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
import CONFIG from '../runtime/config/config'

dotenv.config()

const { SERVER_OUTPUT, WATCH_IGNORE } = CONFIG

const restartServer = (oldServer?: ChildProcess) => {
    if (oldServer) {
        oldServer.kill()
    }
    return fork(path.resolve(SERVER_OUTPUT, 'server.js'), [], {
        env: process.env,
    })
}

export interface WatchServer {
    app: express.Express
    server: Server
    close: () => void
}

const watchServer = (port?: number) =>
    new Promise<WatchServer>(resolve => {
        const serverPort = port || getPort()
        const devServerPort = serverPort + 1

        let devServer: ChildProcess
        let devServerAvailable: Promise<any>

        const serverCompiler = webpack(getWebpackConfig('server', 'dev'))

        const watching = serverCompiler.watch(
            {
                aggregateTimeout: 10000,
                ignored: WATCH_IGNORE,
            },
            () => {
                if (!devServer) {
                    setTimeout(() => openBrowser(devServerPort), 2000)
                }
                devServer = restartServer(devServer)

                setTimeout(() => {
                    devServerAvailable = waitForConnection(serverPort)
                }, 100)
            },
        )

        const app = express()

        app.use(getHotReloadMiddleware())

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
