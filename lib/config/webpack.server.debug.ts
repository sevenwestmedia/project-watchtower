import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverDevConfig from './webpack.server.dev'
import webpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/** Webpack config for the server to enable debugging */
const config = (log: Logger, buildConfig: BuildConfig): webpack.Configuration =>
    merge(
        serverDevConfig(log, buildConfig),
        {
            devtool: 'source-map',
            output: {
                devtoolModuleFilenameTemplate: '[absolute-resource-path]',
                devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
            },
        },
        webpackHooks(log, buildConfig.BASE).serverDebug || {},
    )

export default config
