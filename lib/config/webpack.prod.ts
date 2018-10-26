import webpack from 'webpack'
import { CreateWebpackConfig } from './index'
import TerserPlugin from 'terser-webpack-plugin'
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
            new TerserPlugin({
                sourceMap: true,
                cache: true,
                parallel: true,
                terserOptions: {
                    compress: {},
                    ie8: false,
                },
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
})

export default prodConfig
