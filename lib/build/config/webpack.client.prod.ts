import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import prodConfig from './webpack.prod'

/** Webpack config for the client in production */
const config: webpack.Configuration = merge(
    baseConfig,
    clientBaseConfig,
    prodConfig,
    {
        output: {
            filename: '[name]_[chunkhash].js',
            chunkFilename: '[name]_[chunkhash].js',
        },
        plugins: [
            new ExtractTextPlugin('css/[name].[contenthash:8].css'),
        ],
    },
)

export default config
