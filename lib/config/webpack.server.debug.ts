import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverDevConfig from './webpack.server.dev'

/** Webpack config for the server to enable debugging */
const config: webpack.Configuration = merge(
    serverDevConfig,
    {
        devtool: 'source-map',
        output: {
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
            devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
        },
    },
)

export default config
