import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientDevConfig from './webpack.client.dev'
import getWebpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'

/** Webpack config for the client to improve debugging */
const config = (buildConfig: BuildConfig): webpack.Configuration =>
    merge(
        clientDevConfig(buildConfig),
        {
            devtool: 'source-map',
        },
        getWebpackHooks(buildConfig.BASE).clientDebug || {},
    )

export default config
