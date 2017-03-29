import * as configModule from './config'
import * as assetsModule from './assets'

export { default as extendWebpackConfig } from './extend'
export { getWebpackConfig, getDefaultWebpackConfig } from './build'

export const config = configModule
export const assets = assetsModule
