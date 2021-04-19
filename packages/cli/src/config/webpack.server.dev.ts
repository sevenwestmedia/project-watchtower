import merge from 'webpack-merge'
import { getWebpackHooks, getHook } from './webpack-hooks'
import { baseConfig } from './webpack.base'
import { devConfig } from './webpack.dev'
import { serverBaseConfig } from './webpack.server'
import { CreateWebpackConfig } from '.'
import { getTypeScriptLoaderWebpackConfig } from './typescript-loaders-config'

/** Webpack config for the server in development */
export const serverDevConfig: CreateWebpackConfig = (options) => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)

    return merge(
        baseConfig(options),
        getTypeScriptLoaderWebpackConfig(options, 'server', 'dev'),
        getHook(webpackHooks.base, options),
        serverBaseConfig(options),
        getHook(webpackHooks.server, options),
        devConfig,
        getHook(webpackHooks.dev, options),
        getHook(webpackHooks.serverDev, options),
    )
}
