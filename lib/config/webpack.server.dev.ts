import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import devConfig from './webpack.dev'
import webpackHooks from './webpack-hooks'

/** Webpack config for the server in development */
const config: webpack.Configuration = merge(
    baseConfig,
    webpackHooks.base || {},
    serverBaseConfig,
    webpackHooks.server || {},
    devConfig,
    webpackHooks.dev || {},
    webpackHooks.serverDev || {}
)

export default config
