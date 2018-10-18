import webpack from 'webpack'
import { CreateWebpackConfig } from './index'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

/** Webpack settings for all production builds */
const prodConfig: CreateWebpackConfig = () => ({
    mode: 'production',
    devtool: 'source-map',
    resolve: {
        alias: {
            'project-watchtower/lib': 'project-watchtower/dist-es',
        },
    },
    optimization: {
        minimizer: [
            // Might need to remove this, as minimizer on by default? Not sure if it does source maps
            new UglifyJsPlugin({
                // compress: {
                //     screw_ie8: true,
                //     warnings: false,
                // },
                // mangle: {
                //     screw_ie8: true,
                // },
                sourceMap: true,
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
})

export default prodConfig
