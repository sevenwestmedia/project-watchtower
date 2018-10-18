import webpack from 'webpack'
import webpackMerge from 'webpack-merge'

const merge = (...configs: webpack.Configuration[]): webpack.Configuration =>
    webpackMerge(...configs)

export default merge
