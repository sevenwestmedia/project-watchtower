import webpack from 'webpack'

/** Webpack settings for all development builds */
const devConfig: webpack.Configuration = {
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],
}

export default devConfig
