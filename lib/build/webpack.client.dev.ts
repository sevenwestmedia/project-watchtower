import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import clientBaseConfig from './webpack.client.base'

const config = merge(clientBaseConfig, {
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
})

export default config
