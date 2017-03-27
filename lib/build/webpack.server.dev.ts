import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import serverBaseConfig from './webpack.server.base'

const config = merge(serverBaseConfig, {
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],
})

export default config
