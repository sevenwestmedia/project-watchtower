import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseConfig from './webpack.base'
import clientBaseConfig from './webpack.client'
import devConfig from './webpack.client.dev'
import CONFIG from './config'

const { ASSETS_PATH_PREFIX } = CONFIG

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
            filename: ASSETS_PATH_PREFIX + 'js/[name].js',
            chunkFilename: ASSETS_PATH_PREFIX + 'js/[name].js',
        },
        plugins: [
            new ExtractTextPlugin(ASSETS_PATH_PREFIX + 'css/[name].css'),
            new webpack.HotModuleReplacementPlugin(),
        ],
    },
)

export default config
