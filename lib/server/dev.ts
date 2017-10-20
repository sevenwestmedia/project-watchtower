import * as express from 'express'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import * as opn from 'opn'
import { getPort } from '../runtime/server/server'
import { getWebpackConfig } from '../build/build'
import CONFIG from '../runtime/config/config'

const { PUBLIC_PATH, WATCH_IGNORE } = CONFIG

export type HotReloadMiddleware = () => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = () => {
    const config = getWebpackConfig('client', 'dev')
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(compiler, {
        publicPath: PUBLIC_PATH,
        noInfo: true,
        // do not serve index.html on / route
        // https://github.com/webpack/webpack-dev-middleware/issues/153
        index: 'foobar',
        stats: 'errors-only',
        watchOptions: {
            ignored: WATCH_IGNORE
        }
    })

    const hot = webpackHotMiddleware(compiler)

    return [dev, hot]
}

export const openBrowser = (port?: number) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }
    const usePort = port || getPort()
    opn(`http://localhost:${usePort}`)
}
