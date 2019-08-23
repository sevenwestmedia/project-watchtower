import AssetsPlugin from 'assets-webpack-plugin'
import express from 'express'
import { BuildConfig } from 'lib/runtime/server'
import opn from 'opn'
import { Logger } from 'typescript-log'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { getWebpackConfig } from '../build/build'

export type HotReloadMiddleware = (
    log: Logger,
    buildConfig: BuildConfig,
) => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = (log, buildConfig) => {
    const config = getWebpackConfig(log, buildConfig, 'client', 'dev')
    if (!config) {
        throw new Error('Unable to load webpack config')
    }

    if (config.plugins) {
        config.plugins = config.plugins.filter(plugin => !(plugin instanceof AssetsPlugin))
    }
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(compiler, {
        // do not serve index.html on / route
        // https://github.com/webpack/webpack-dev-middleware/issues/153
        index: 'foobar',
        logLevel: 'silent',
        publicPath: buildConfig.PUBLIC_PATH,
        stats: 'errors-only',
    })

    const hot = webpackHotMiddleware(compiler)

    return [dev, hot]
}

export const openBrowser = async (log: Logger, port: number) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }

    try {
        await opn(`http://localhost:${port}`)
    } catch (e) {
        log.warn(e, 'Opening browser failed')
    }
}
