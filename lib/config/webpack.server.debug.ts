import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverDevConfig from './webpack.server.dev'
import webpackHooks from './webpack-hooks'
import { BuildConfig } from '../../lib'

/** Webpack config for the server to enable debugging */
const config = (buildConfig: BuildConfig): webpack.Configuration =>
    merge(
        serverDevConfig(buildConfig),
        {
            devtool: 'source-map',
            output: {
                devtoolModuleFilenameTemplate: '[absolute-resource-path]',
                devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
            },
        },
        webpackHooks(buildConfig.BASE).serverDebug || {},
    )

export default config
