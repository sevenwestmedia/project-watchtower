import * as path from 'path'
import { fork, ChildProcess } from 'child_process'
import * as express from 'express'
import * as webpack from 'webpack'
import * as proxyMiddleware from 'http-proxy-middleware'
import * as dotenv from 'dotenv'
import { getWebpackConfig } from '../build/build'
import { openBrowser, getHotReloadMiddleware } from '../server/dev'
import { waitForConnection } from '../__util/network'
import CONFIG from '../config/config'

dotenv.config()

const { SERVER_OUTPUT } = CONFIG

const restartServer = (oldServer?: ChildProcess) => {
    if (oldServer) {
        oldServer.kill()
    }
    return fork(path.resolve(SERVER_OUTPUT, 'server.js'), [], {
        env: process.env,
    })
}

const watchServer = (port?: number) => (
    new Promise((resolve) => {
        const serverPort = parseInt(port || process.env.PORT || 3000, 10)
        const devServerPort = serverPort + 1

        let devServer: ChildProcess
        let devServerAvailable: Promise<any>

        const serverCompiler = webpack(getWebpackConfig('server', 'dev'))

        serverCompiler.watch({
            aggregateTimeout: 10000,
            ignored: /node_modules/,
        }, () => {
            if (!devServer) {
                setTimeout(() => openBrowser(devServerPort), 2000)
            }
            devServer = restartServer(devServer)

            setTimeout(() => {
                devServerAvailable = waitForConnection(serverPort)
            }, 100)
        })

        const app = express()

        app.use(getHotReloadMiddleware())

        app.use(async (_req, _res, next) => {
            await devServerAvailable
            next()
        })

        app.use(proxyMiddleware('http://localhost:' + serverPort))

        app.listen(devServerPort, () => resolve())
    })
)

export default watchServer
