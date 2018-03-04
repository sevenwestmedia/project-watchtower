import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientDevConfig from './webpack.client.dev'
import getWebpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/** Webpack config for the client to improve debugging */
const config = (log: Logger, buildConfig: BuildConfig): webpack.Configuration =>
    merge(
        clientDevConfig(log, buildConfig),
        {
            devtool: 'source-map',
        },
        getWebpackHooks(log, buildConfig.BASE).clientDebug || {},
    )

export default config
