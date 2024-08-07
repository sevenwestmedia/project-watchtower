import webpack from 'webpack'
import { CreateWebpackConfig } from '.'
import { EsbuildPlugin } from 'esbuild-loader'

/** Webpack settings for all production builds */
export const prodConfig: CreateWebpackConfig = () => ({
    devtool: 'source-map',
    mode: 'production',
    optimization: {
        minimizer: [
            new EsbuildPlugin({
                target: 'esnext',
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
