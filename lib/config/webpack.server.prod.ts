import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import prodConfig from './webpack.prod'
import getWebpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'

/** Webpack config for the server in production */
const config = (buildConfig: BuildConfig): webpack.Configuration => {
    const webpackHooks = getWebpackHooks(buildConfig.BASE)

    return merge(
        baseConfig(buildConfig),
        webpackHooks.base || {},
        serverBaseConfig(buildConfig),
        webpackHooks.server || {},
        prodConfig,
        webpackHooks.prod || {},
        webpackHooks.serverProd || {},
    )
}

export default config
