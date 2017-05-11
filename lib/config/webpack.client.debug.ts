import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientDevConfig from './webpack.client.dev'

/** Webpack config for the client to improve debugging */
const config: webpack.Configuration = merge(
    clientDevConfig,
    {
        devtool: 'source-map',
    },
)

export default config
