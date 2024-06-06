import webpack from 'webpack'
import { CreateWebpackConfig } from '.'
import { ESBuildMinifyPlugin } from 'esbuild-loader'

/** Webpack settings for all production builds */
export const prodConfig: CreateWebpackConfig = () => ({
    devtool: 'source-map',
    mode: 'production',
    optimization: {
        minimizer: [
            new ESBuildMinifyPlugin({
                target: 'es2015',
            }),
        ],
    },
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
})
