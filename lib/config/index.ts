import webpack from 'webpack'
import { BuildConfig } from '../index'
import { Logger } from '../runtime/universal'

export { default as base } from './webpack.base'
export { default as clientBase } from './webpack.client'
export { default as clientDev } from './webpack.client.dev'
export { default as clientDebug } from './webpack.client.debug'
export { default as clientProd } from './webpack.client.prod'
export { default as serverBase } from './webpack.server'
export { default as serverDev } from './webpack.server.dev'
export { default as serverDebug } from './webpack.server.debug'
export { default as serverProd } from './webpack.server.prod'
export { default as devBase } from './webpack.dev'
export { default as prodBase } from './webpack.prod'
export { getConfig } from '../runtime/config/config'

export type CreateWebpackConfigOptions = {
    buildConfig: BuildConfig
    log: Logger
    cacheDirectory: string
}
export type CreateWebpackConfig = (options: CreateWebpackConfigOptions) => webpack.Configuration
