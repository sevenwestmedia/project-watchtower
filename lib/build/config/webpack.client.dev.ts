import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import devConfig from './webpack.client.dev'

/** Webpack config for the client in development */
const config: webpack.Configuration = merge(
    baseConfig,
    clientBaseConfig,
    devConfig,
    {
        entry: {
            main: [
                'webpack-hot-middleware/client',
            ],
        },
        output: {
            filename: '[name].js',
            chunkFilename: '[name].js',
        },
        plugins: [
            new ExtractTextPlugin('css/[name].css'),
            new webpack.HotModuleReplacementPlugin(),
        ],
    },
)

export default config
