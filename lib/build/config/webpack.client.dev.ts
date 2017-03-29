import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import clientBaseConfig from './webpack.client.base'

/**
 * Webpack config for the client in development
 */
const config = merge(clientBaseConfig, {
    devtool: 'cheap-module-source-map',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new ExtractTextPlugin('css/[name].css'),
        new webpack.HotModuleReplacementPlugin(),
    ],
})

export default config
