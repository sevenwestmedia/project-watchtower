import { Logger } from 'typescript-log'
import webpack from 'webpack'

/*
 * The /runtime folder should only contain modules that do not have transitive dependencies!
 * All exceptions must either
 * - be dynamically imported using require() in development environments
 * - be documented in the README and set as production peerDependencies
 */

export * from './config'
export * from './server/assets'
export * from './server/server'
export * from './universal'
export * from './server/ssr/index'

export { getConfig } from './config/config'

export interface RuntimeConfig {
    /** The url prefix which static files can load from */
    ASSETS_PATH_PREFIX: string

    /** The path where the static files are resolved from */
    ASSETS_PATH: string

    /** Path to public files */
    SERVER_PUBLIC_DIR: string | false

    /** Client url path to public */
    PUBLIC_PATH: string

    /** The root to look for index.html and other root files */
    BASE: string
}

/** Application build configuration */
export interface BuildConfig {
    /** Prefix for all assets (JS, CSS, media, fonts) with trailing slash */
    ASSETS_PATH_PREFIX: string

    /** root path of your application */
    BASE: string

    /** entry file for the client */
    CLIENT_ENTRY: string

    /** file for client polyfills if needed */
    CLIENT_POLYFILLS: string | false

    /** output directory for the build */
    OUTPUT: string

    /** set to false if the application is serverless */
    HAS_SERVER: boolean

    /** Default port for the dev server (when process.env.PORT is not set) */
    DEV_SERVER_PORT: number

    /** URL prefix for all resources */
    PUBLIC_PATH: string

    /** entry file for the server if applicable */
    SERVER_ENTRY: string

    /** if true, all externals will be bundled */
    SERVER_BUNDLE_ALL: boolean

    /** Include all modules, except a blacklist */
    SERVER_BUNDLE_ALL_EXCEPT?: string[]

    /** modules which the server build includes in the bundle */
    SERVER_INCLUDE_IN_BUNDLE: string[]

    /** directory that is served as static resources */
    SERVER_PUBLIC_DIR: string | false

    /** if true, no hash is added to the generated assets */
    STATIC_RESOURCE_NAMES: boolean

    /** Additional environment variables for build stats */
    STATS_ENV: { [key: string]: string }

    /** Pages to run build stats on, format { name: URL } */
    STATS_PAGES: { [name: string]: string }

    /** Enables the SMP plugin https://www.npmjs.com/package/speed-measure-webpack-plugin */
    SMP?: boolean

    TS_CONFIG_CLIENT?: string
    TS_CONFIG_SERVER?: string
}

/** Use to override the application configuration */
export type BuildConfigOverride = Partial<BuildConfig>

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
    cacheDirectory: string
}
export type CreateWebpackConfig = (options: CreateWebpackConfigOptions) => webpack.Configuration
