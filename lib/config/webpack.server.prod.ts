import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import baseConfig from './webpack.base'
import serverBaseConfig from './webpack.server'
import prodConfig from './webpack.prod'

/** Webpack config for the server in production */
const config: webpack.Configuration = merge(
    baseConfig,
    serverBaseConfig,
    prodConfig,
)

export default config
