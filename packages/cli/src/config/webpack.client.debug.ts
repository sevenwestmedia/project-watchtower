import merge from 'webpack-merge'
import { getWebpackHooks, getHook } from './webpack-hooks'
import { clientDevConfig } from './webpack.client.dev'
import { CreateWebpackConfig } from '.'

/** Webpack config for the client to improve debugging */
export const clientDebugConfig: CreateWebpackConfig = (options) =>
    merge(
        clientDevConfig(options),
        {
            devtool: 'source-map',
        },
        getHook(getWebpackHooks(options.log, options.buildConfig.BASE).clientDebug, options),
    )
