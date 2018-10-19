import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'
import getWebpackHooks, { getHook } from './webpack-hooks'
import { CreateWebpackConfig, smp } from './index'

/** Webpack config for the client in production */
const config: CreateWebpackConfig = options => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)

    const chunkFilename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    const cssFilename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'css/[name].css'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'css/[name].[contenthash:8].css'

    return smp(
        options,
        merge(
            baseConfig(options),
            getHook(webpackHooks.base, options),
            clientBaseConfig(options),
            getHook(webpackHooks.client, options),
            prodConfig(options),
            getHook(webpackHooks.prod, options),
            {
                output: {
                    filename: chunkFilename,
                    chunkFilename,
                },
                plugins: [new MiniCssExtractPlugin({ filename: cssFilename })],
            },
            getHook(webpackHooks.clientProd, options),
        ),
    )
}

export default config
