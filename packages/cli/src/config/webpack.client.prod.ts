import merge from 'webpack-merge'

import getWebpackHooks, { getHook } from './webpack-hooks'
import { baseConfig } from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'
import { CreateWebpackConfig } from '.'
import { getTsLoaderWebpackConfig } from './ts-loader-config'

/** Webpack config for the client in production */
const config: CreateWebpackConfig = options => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)
    const filename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    const chunkFilename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    return merge(
        baseConfig(options),
        getTsLoaderWebpackConfig(options, 'client', 'prod'),
        getHook(webpackHooks.base, options),
        clientBaseConfig(options),
        getHook(webpackHooks.client, options),
        prodConfig(options),
        getHook(webpackHooks.prod, options),
        {
            output: {
                chunkFilename,
                filename,
            },
            plugins: [],
        },
        getHook(webpackHooks.clientProd, options),
    )
}

export default config
