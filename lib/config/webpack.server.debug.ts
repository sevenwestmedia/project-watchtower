import * as merge from 'webpack-merge'
import serverDevConfig from './webpack.server.dev'
import webpackHooks, { getHook } from './webpack-hooks'
import { CreateWebpackConfig } from './index'

/** Webpack config for the server to enable debugging */
const config: CreateWebpackConfig = options =>
    merge(
        serverDevConfig(options),
        {
            devtool: 'source-map',
            output: {
                devtoolModuleFilenameTemplate: '[absolute-resource-path]',
                devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
            },
        },
        getHook(webpackHooks(options.log, options.buildConfig.BASE).serverDebug, options),
    )

export default config
