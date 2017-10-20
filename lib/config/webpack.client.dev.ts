import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import devConfig from './webpack.dev'
import CONFIG from '../runtime/config/config'
import webpackHooks from './webpack-hooks'

const { ASSETS_PATH_PREFIX } = CONFIG

/** Webpack config for the client in development */
const config: webpack.Configuration = merge(
    baseConfig,
    webpackHooks.base || {},
    clientBaseConfig,
    webpackHooks.client || {},
    devConfig,
    webpackHooks.dev || {},
    {
        entry: {
            main: ['webpack-hot-middleware/client?noInfo=true'],
        },
        output: {
            filename: ASSETS_PATH_PREFIX + 'js/[name].js',
            chunkFilename: ASSETS_PATH_PREFIX + 'js/[name].js',
        },
        plugins: [
            new ExtractTextPlugin(ASSETS_PATH_PREFIX + 'css/[name].css'),
            new webpack.HotModuleReplacementPlugin(),
        ],
    },
    webpackHooks.clientDev || {},
)

export default config
