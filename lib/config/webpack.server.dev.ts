import merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import devConfig from './webpack.dev'
import getWebpackHooks, { getHook } from './webpack-hooks'
import { CreateWebpackConfig } from './index'

/** Webpack config for the server in development */
const config: CreateWebpackConfig = options => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)

    return merge(
        baseConfig(options),
        getHook(webpackHooks.base, options),
        serverBaseConfig(options),
        getHook(webpackHooks.server, options),
        devConfig,
        getHook(webpackHooks.dev, options),
        getHook(webpackHooks.serverDev, options),
    )
}

export default config
