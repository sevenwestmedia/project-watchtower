import merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import prodConfig from './webpack.prod'
import getWebpackHooks, { getHook } from './webpack-hooks'
import { CreateWebpackConfig, smp } from './index'

/** Webpack config for the server in production */
const config: CreateWebpackConfig = options => {
    const webpackHooks = getWebpackHooks(options.log, options.buildConfig.BASE)

    return smp(
        options,
        merge(
            baseConfig(options),
            getHook(webpackHooks.base, options),
            serverBaseConfig(options),
            getHook(webpackHooks.server, options),
            prodConfig(options),
            getHook(webpackHooks.prod, options),
            getHook(webpackHooks.serverProd, options),
        ),
    )
}

export default config
