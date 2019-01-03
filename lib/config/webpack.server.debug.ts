import merge from 'webpack-merge'
import { CreateWebpackConfig } from './index'
import webpackHooks, { getHook } from './webpack-hooks'
import serverDevConfig from './webpack.server.dev'

/** Webpack config for the server to enable debugging */
const config: CreateWebpackConfig = options =>
    merge(
        serverDevConfig(options),
        {
            devtool: 'source-map',
            output: {
                devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
                devtoolModuleFilenameTemplate: '[absolute-resource-path]',
            },
        },
        getHook(webpackHooks(options.log, options.buildConfig.BASE).serverDebug, options),
    )

export default config
