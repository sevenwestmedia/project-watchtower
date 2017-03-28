import * as webpack from 'webpack'
import * as merge from 'webpack-merge'

const extendWebpackConfig = (
    baseConfig: webpack.Configuration,
    newConfig: Partial<webpack.Configuration>,
) => (
    merge(baseConfig, newConfig)
)
export default extendWebpackConfig
