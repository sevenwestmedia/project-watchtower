import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'
import getWebpackHooks from './webpack-hooks'
import { BuildConfig } from 'lib'

/** Webpack config for the client in production */
const config = (buildConfig: BuildConfig): webpack.Configuration => {
    const webpackHooks = getWebpackHooks(buildConfig.BASE)

    const chunkFilename = buildConfig.STATIC_RESOURCE_NAMES
        ? buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    const cssFilename = buildConfig.STATIC_RESOURCE_NAMES
        ? buildConfig.ASSETS_PATH_PREFIX + 'css/[name].css'
        : buildConfig.ASSETS_PATH_PREFIX + 'css/[name].[contenthash:8].css'

    return merge(
        baseConfig(buildConfig),
        webpackHooks.base || {},
        clientBaseConfig(buildConfig),
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
}

export default config
