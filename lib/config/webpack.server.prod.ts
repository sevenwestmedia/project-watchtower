import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import prodConfig from './webpack.prod'
import webpackHooks from './webpack-hooks'

/** Webpack config for the server in production */
const config: webpack.Configuration = merge(
    baseConfig,
    webpackHooks.base || {},
    serverBaseConfig,
    webpackHooks.server || {},
    prodConfig,
    webpackHooks.prod || {},
    webpackHooks.serverProd || {},
)

export default config
