import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import CONFIG from '../runtime/config/config'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'
import webpackHooks from './webpack-hooks'

const { STATIC_RESOURCE_NAMES, ASSETS_PATH_PREFIX } = CONFIG

const chunkFilename = STATIC_RESOURCE_NAMES
    ? ASSETS_PATH_PREFIX + 'js/[name].js'
    : ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

const cssFilename = STATIC_RESOURCE_NAMES
    ? ASSETS_PATH_PREFIX + 'css/[name].css'
    : ASSETS_PATH_PREFIX + 'css/[name].[contenthash:8].css'

/** Webpack config for the client in production */
const config: webpack.Configuration = merge(
    baseConfig,
    webpackHooks.base || {},
    clientBaseConfig,
    webpackHooks.client || {},
    prodConfig,
    webpackHooks.prod || {},
    {
        output: {
            filename: chunkFilename,
            chunkFilename,
        },
        plugins: [new ExtractTextPlugin(cssFilename)],
    },
    webpackHooks.clientProd || {},
)

export default config
