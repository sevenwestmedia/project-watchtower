import webpack from 'webpack'
import merge from 'webpack-merge'
import { CreateWebpackConfig } from './index'
import getWebpackHooks, { getHook } from './webpack-hooks'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import devConfig from './webpack.dev'

/** Webpack config for the client in development */
const config: CreateWebpackConfig = options => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)

    return merge(
        baseConfig(options),
        getHook(webpackHooks.base, options),
        clientBaseConfig(options),
        getHook(webpackHooks.client, options),
        devConfig,
        getHook(webpackHooks.dev, options),
        {
            entry: {
                main: ['webpack-hot-middleware/client?noInfo=true'],
            },
            output: {
                chunkFilename: options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].chunk.js',
                filename: options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js',
            },
            plugins: [new webpack.HotModuleReplacementPlugin()],
        },
        getHook(webpackHooks.clientDev, options),
    )
}

export default config
