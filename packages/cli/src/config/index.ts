import webpack from 'webpack'
import { Logger } from 'typescript-log'
import { BuildConfig } from '@project-watchtower/server'

export { baseConfig } from './webpack.base'
export { devConfig } from './webpack.dev'
export { prodConfig } from './webpack.prod'
export { clientBaseConfig } from './webpack.client'
export { clientDevConfig } from './webpack.client.dev'
export { clientDebugConfig } from './webpack.client.debug'
export { clientProdConfig } from './webpack.client.prod'
export { serverBaseConfig } from './webpack.server'
export { serverDevConfig } from './webpack.server.dev'
export { serverDebugConfig } from './webpack.server.debug'
export { serverProdConfig } from './webpack.server.prod'

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
    buildConfig: BuildConfig
    log: Logger
}

export type CreateWebpackConfig = (options: CreateWebpackConfigOptions) => webpack.Configuration
