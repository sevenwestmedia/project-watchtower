import * as merge from 'webpack-merge'
import clientDevConfig from './webpack.client.dev'
import getWebpackHooks, { getHook } from './webpack-hooks'
import { CreateWebpackConfig } from './index'

/** Webpack config for the client to improve debugging */
const config: CreateWebpackConfig = options =>
    merge(
        clientDevConfig(options),
        {
            devtool: 'source-map',
        },
        getHook(getWebpackHooks(options.log, options.buildConfig.BASE).clientDebug, options),
    )

export default config
