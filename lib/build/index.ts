import * as webpack from 'webpack'
import * as merge from 'webpack-merge'

export { default as clientDevConfig } from './webpack.client.dev'
export { default as clientProdConfig } from './webpack.client.prod'
export { default as serverDevConfig } from './webpack.server.dev'
export { default as serverProdConfig } from './webpack.server.prod'


export const extendWebpackConfig = (
    baseConfig: webpack.Configuration,
    newConfig: Partial<webpack.Configuration>,
) => (
    merge(baseConfig, newConfig)
)
