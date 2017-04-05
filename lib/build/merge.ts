import * as webpack from 'webpack'
import * as webpackMerge from 'webpack-merge'

const merge = (...configs: webpack.Configuration[]): webpack.Configuration => (
    webpackMerge(...configs)
)

export default merge
