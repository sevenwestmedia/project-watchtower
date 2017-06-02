import * as express from 'express'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import * as opn from 'opn'
import { getPort } from '../runtime/server/server'
import { getWebpackConfig } from '../build/build'
import { webpackStatsConfig } from '../util/webpack'
import CONFIG from '../runtime/config/config'

const { PUBLIC_PATH, WATCH_IGNORE } = CONFIG

export type HotReloadMiddleware = () => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = () => {
    const config = getWebpackConfig('client', 'dev')
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(
        compiler,
        {
            publicPath: PUBLIC_PATH,
            noInfo: true,
            stats: {
                ...webpackStatsConfig,
                assets: false,
                version: false,
                hash: false,
                timings: false,
            },
            watchOptions: {
                ignored: WATCH_IGNORE,
                aggregateTimeout: 1000,
            },
        },
    )

    const hot = webpackHotMiddleware(compiler, {
        noInfo: true,
    })

    return [
        dev,
        hot,
    ]
}

export const openBrowser = (port?: number) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }
    const usePort = port || getPort()
    opn(`http://localhost:${usePort}`)
}
