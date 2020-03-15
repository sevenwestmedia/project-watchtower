import { ChildProcess, fork } from 'child_process'
import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { Logger } from 'typescript-log'
import webpack from 'webpack'
import { getWebpackConfig } from '../build/build'
import { BuildConfig, findFreePort, getPort, waitForConnection } from '@project-watchtower/server'
import { openBrowser, getHotReloadMiddleware } from '../server/dev'
import { webpackStatsConfig } from '../utils/webpack'

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
            WATCHTOWER_SERVER: 'true',
            PORT: port.toString(),
            PROJECT_DIR: projectDir,
        },
    })
}

export interface WatchServer {
    app: express.Express
    server: Server
    close: () => Promise<any>
}

export async function watchServer(log: Logger, buildConfig: BuildConfig) {
    dotenv.config({
        path: path.join(buildConfig.BASE, '.env'),
    })

    const hostPort = await findFreePort(getPort(buildConfig.DEV_SERVER_PORT))
    const devServerPort = await findFreePort(hostPort + 1)

    let devServer: ChildProcess
    let devServerAvailable: Promise<any>

    const serverConfig = getWebpackConfig(log, buildConfig, 'server', 'dev')
    const serverCompiler = webpack(serverConfig)

    serverCompiler.hooks.invalid.tap('invalid', () => {
        log.info('⭐  Server changed, rebuilding and restarting server...  ⭐')
    })

    const watching = serverCompiler.watch({}, (err, stats) => {
        if (!devServer) {
            setTimeout(() => openBrowser(log, hostPort), 2000)
        }

        if (err) {
            log.error({ err }, 'Failed to compile')
            return
        } else {
            const statsString = stats.toString(webpackStatsConfig)

            log.info(statsString)

            if (stats.hasErrors()) {
                log.error('Stats has errors')
                return
            }
        }
        devServer = restartServer(buildConfig, devServerPort, buildConfig.BASE, devServer)

        setTimeout(() => {
            devServerAvailable = waitForConnection(devServerPort)
        }, 100)
    })

    const app = express()

    app.use(getHotReloadMiddleware(log, buildConfig))

    app.use(async (_req, _res, next) => {
        await devServerAvailable
        next()
    })

    app.use(createProxyMiddleware('http://localhost:' + devServerPort))

    const watchServer = await new Promise<WatchServer>(resolve => {
        const server = app.listen(hostPort, () => {
            resolve({
                app,
                close: () => {
                    return Promise.all([
                        new Promise(closeResolve =>
                            watching.close(() => {
                                closeResolve()
                            }),
                        ),
                        new Promise(closeResolve => server.close(() => closeResolve())),
                    ]).then(() => {
                        if (devServer) {
                            devServer.kill()
                        }
                    })
                },
                server,
            })
        })
    })

    app.set('server', watchServer)

    return watchServer
}
