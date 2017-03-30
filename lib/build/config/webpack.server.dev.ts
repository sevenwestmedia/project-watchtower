import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import devConfig from './webpack.dev'

/** Webpack config for the server in development */
const config: webpack.Configuration = merge(
    baseConfig,
    serverBaseConfig,
    devConfig,
)

export default config
