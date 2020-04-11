import open from 'open'
import express from 'express'
import webpack from 'webpack'
import AssetsPlugin from 'assets-webpack-plugin'
import { Logger } from 'typescript-log'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { getWebpackConfig } from '../build/build'
import { BuildConfig } from '@project-watchtower/server'

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
        config.plugins = config.plugins.filter((plugin) => !(plugin instanceof AssetsPlugin))
    }
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(compiler, {
        // do not serve index.html on / route
        // https://github.com/webpack/webpack-dev-middleware/issues/153
        index: 'foobar',
        publicPath: buildConfig.PUBLIC_PATH,
    })

    const hot = webpackHotMiddleware(compiler, {
        log: (msg, ...params) =>
            params && params.length ? log.info({ params }, msg) : log.info(msg),
    })

    return [dev, hot]
}

export async function openBrowser(log: Logger, port: number) {
    if (process.env.NODE_ENV === 'test') {
        return
    }

    try {
        await open(`http://localhost:${port}`, { url: true })
    } catch (e) {
        log.warn(e, 'Opening browser failed')
    }
}
