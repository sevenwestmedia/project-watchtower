import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import CONFIG from './config'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'

const { STATIC_RESOURCE_NAMES } = CONFIG

const chunkFilename = STATIC_RESOURCE_NAMES
    ? '[name].js'
    : '[name]_[chunkhash].js'

const cssFilename = STATIC_RESOURCE_NAMES
    ? 'css/[name].css'
    : 'css/[name].[contenthash:8].css'

/** Webpack config for the client in production */
const config: webpack.Configuration = merge(
    baseConfig,
    clientBaseConfig,
    prodConfig,
    {
        output: {
            filename: chunkFilename,
            chunkFilename,
        },
        plugins: [
            new ExtractTextPlugin(cssFilename),
        ],
    },
)

export default config
