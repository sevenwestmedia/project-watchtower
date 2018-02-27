import * as webpack from 'webpack'

/** Webpack settings for all production builds */
const prodConfig: webpack.Configuration = {
    devtool: 'source-map',
    resolve: {
        alias: {
            'project-watchtower/lib': 'project-watchtower/dist-es',
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false,
            },
            mangle: {
                screw_ie8: true,
            },
            sourceMap: true,
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
}

export default prodConfig
