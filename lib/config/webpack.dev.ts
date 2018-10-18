import webpack from 'webpack'

/** Webpack settings for all development builds */
const devConfig: webpack.Configuration = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    plugins: [],
}

export default devConfig
