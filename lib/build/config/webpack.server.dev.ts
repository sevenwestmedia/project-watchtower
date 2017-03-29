import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverBaseConfig from './webpack.server.base'

/**
 * Webpack config for the server in development
 */
const config = merge(serverBaseConfig, {
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],
})

export default config
