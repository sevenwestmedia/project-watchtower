import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverBaseConfig from './webpack.server.base'

/**
 * Webpack config for the server in production
 */
const config = merge(serverBaseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false,
            },
            mangle: {
                screw_ie8: true,
            },
            comments: false,
        }),
    ],
})

export default config
