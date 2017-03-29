import * as configModule from './config'

export { default as extendWebpackConfig } from './extend'
export { getWebpackConfig, getDefaultWebpackConfig } from './build'

export const config = configModule
