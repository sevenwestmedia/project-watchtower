import merge from 'webpack-merge'

import { getWebpackHooks, getHook } from './webpack-hooks'
import { serverDevConfig } from './webpack.server.dev'
import { CreateWebpackConfig } from '.'

/** Webpack config for the server to enable debugging */
export const serverDebugConfig: CreateWebpackConfig = (options) =>
    merge(
        serverDevConfig(options),
        {
            devtool: 'source-map',
            output: {
                devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
                devtoolModuleFilenameTemplate: '[absolute-resource-path]',
            },
        },
        getHook(getWebpackHooks(options.log, options.buildConfig.BASE).serverDebug, options),
    )
