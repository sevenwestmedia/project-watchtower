import webpack from 'webpack'

/** Webpack settings for all development builds */
const devConfig: webpack.Configuration = {
    devtool: 'cheap-module-source-map',
    mode: 'development',
    plugins: [],
}

export default devConfig
