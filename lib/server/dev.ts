import * as express from 'express'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import * as opn from 'opn'
import { getPort } from '../runtime/server/server'
import { getWebpackConfig } from '../build/build'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

export type HotReloadMiddleware = (
    log: Logger,
    buildConfig: BuildConfig,
) => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = (log, buildConfig) => {
    const config = getWebpackConfig(log, buildConfig, 'client', 'dev')
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(compiler, {
        publicPath: buildConfig.PUBLIC_PATH,
        noInfo: true,
        // do not serve index.html on / route
        // https://github.com/webpack/webpack-dev-middleware/issues/153
        index: 'foobar',
        stats: 'errors-only',
    })

    const hot = webpackHotMiddleware(compiler)

    return [dev, hot]
}

export const openBrowser = (buildConfig: BuildConfig, port?: number) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }
    const usePort = port || getPort(buildConfig)
    opn(`http://localhost:${usePort}`)
}
