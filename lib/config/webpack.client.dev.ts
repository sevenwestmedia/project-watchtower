import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import devConfig from './webpack.dev'
import getWebpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/** Webpack config for the client in development */
const config = (log: Logger, buildConfig: BuildConfig): webpack.Configuration => {
    const webpackHooks = getWebpackHooks(log, buildConfig.BASE)
    return merge(
        baseConfig(buildConfig),
        webpackHooks.base || {},
        clientBaseConfig(buildConfig),
        webpackHooks.client || {},
        devConfig,
        webpackHooks.dev || {},
        {
            entry: {
                main: ['webpack-hot-middleware/client?noInfo=true'],
            },
            output: {
                filename: buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js',
                chunkFilename: buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js',
            },
            plugins: [
                new ExtractTextPlugin(buildConfig.ASSETS_PATH_PREFIX + 'css/[name].css'),
                new webpack.HotModuleReplacementPlugin(),
            ],
        },
        webpackHooks.clientDev || {},
    )
}

export default config
