import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientDevConfig from './webpack.client.dev'
import webpackHooks from './webpack-hooks'

/** Webpack config for the client to improve debugging */
const config: webpack.Configuration = merge(
    clientDevConfig,
    {
        devtool: 'source-map',
    },
    webpackHooks.clientDebug || {},
)

export default config
