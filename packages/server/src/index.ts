/*
 * The /runtime folder should only contain modules that do not have transitive dependencies!
 * All exceptions must either
 * - be dynamically imported using require() in development environments
 * - be documented in the README and set as production peerDependencies
 */

export * from './config/config'
export * from './environment'
export * from './server'
export * from './ssr'
export * from './assets'
export * from './utils/fs'
export * from './utils/network'
export * from './utils/promise-tracker'
export * from '../../runtime/src/function-timer'

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

    ADDITIONAL_CIENT_ENTRIES?: {
        [name: string]: string[]
    }

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

    /** Include all modules, except those specified */
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

    BABEL_CONFIG_CLIENT?: string
    BABEL_CONFIG_SERVER?: string
}

/** Use to override the application configuration */
export type BuildConfigOverride = Partial<BuildConfig>
