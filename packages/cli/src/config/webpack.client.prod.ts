import merge from 'webpack-merge'

import { getWebpackHooks, getHook } from './webpack-hooks'
import { baseConfig } from './webpack.base'
import { clientBaseConfig } from './webpack.client'
import { prodConfig } from './webpack.prod'
import { CreateWebpackConfig } from '.'
import { getTypeScriptLoaderWebpackConfig } from './typescript-loaders-config'
import { ESBuildMinifyPlugin } from 'esbuild-loader'

/** Webpack config for the client in production */
export const clientProdConfig: CreateWebpackConfig = (options) => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)
    const filename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    const chunkFilename = options.buildConfig.STATIC_RESOURCE_NAMES
        ? options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name].js'
        : options.buildConfig.ASSETS_PATH_PREFIX + 'js/[name]_[chunkhash].js'

    return merge(
        baseConfig(options),
        getTypeScriptLoaderWebpackConfig(options, 'client', 'prod'),
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
        {
            optimization: {
                minimizer: [
                    new ESBuildMinifyPlugin({
                        target: 'es2015',
                        format: 'iife',
                    }),
                ],
            },
        },
    )
}
