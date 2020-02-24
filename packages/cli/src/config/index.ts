import webpack from 'webpack'
import { Logger } from 'typescript-log'
import { BuildConfig } from '@project-watchtower/server'

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

/** Override the webpack config per target and environment */
export interface WebpackHooks {
    base?: webpack.Configuration | CreateWebpackConfig
    server?: webpack.Configuration | CreateWebpackConfig
    client?: webpack.Configuration | CreateWebpackConfig
    dev?: webpack.Configuration | CreateWebpackConfig
    prod?: webpack.Configuration | CreateWebpackConfig
    serverDev?: webpack.Configuration | CreateWebpackConfig
    serverProd?: webpack.Configuration | CreateWebpackConfig
    serverDebug?: webpack.Configuration | CreateWebpackConfig
    clientDev?: webpack.Configuration | CreateWebpackConfig
    clientProd?: webpack.Configuration | CreateWebpackConfig
    clientDebug?: webpack.Configuration | CreateWebpackConfig
}

export interface CreateWebpackConfigOptions {
    cacheDirectory: string
    buildConfig: BuildConfig
    log: Logger
}

export type CreateWebpackConfig = (options: CreateWebpackConfigOptions) => webpack.Configuration
