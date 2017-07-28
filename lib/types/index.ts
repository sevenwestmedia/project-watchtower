import * as webpack from 'webpack'

/** Created assets in the webpack build */
export interface Assets {
    vendor: {
        js: string,
    }
    main: {
        js: string,
        css: string,
    }
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

    /** output directory for the client build */
    CLIENT_OUTPUT: string

    /** Autoprefixer browser compatibilty  */
    CSS_AUTOPREFIXER: string[]

    /** set to false if the application is serverless */
    HAS_SERVER: boolean,

    /** List paths to exclude from linting */
    LINT_EXCLUDE: string[]

    /** Paths where modules are resolved */
    MODULE_PATHS: string[]

    /** Default port for the server (when process.env.PORT is not set) */
    PORT: number

    /** URL prefix for all resources */
    PUBLIC_PATH: string

    /** entry file for the server if applicable */
    SERVER_ENTRY: string

    /** modules which the server build includes in the bundle */
    SERVER_INCLUDE_IN_BUNDLE: string[]

    /** output directory of the server */
    SERVER_OUTPUT: string

    /** directory that is served as static resources */
    SERVER_PUBLIC_DIR: string | false

    /** if true, no hash is added to the generated assets */
    STATIC_RESOURCE_NAMES: boolean

    /** Additional environment variables for build stats */
    STATS_ENV: { [key: string]: string }

    /** Pages to run build stats on, format { name: URL } */
    STATS_PAGES: { [name: string]: string }

    /** Regular expression of paths to be ignored in watch mode */
    WATCH_IGNORE: RegExp

}

/** Use to override the application configuration */
export type BuildConfigOverride = Partial<BuildConfig>

/** Override the webpack config per target and environment */
export interface WebpackHooks {
    base?: webpack.Configuration,
    server?: webpack.Configuration,
    client?: webpack.Configuration,
    dev?: webpack.Configuration,
    prod?: webpack.Configuration,
    serverDev?: webpack.Configuration,
    serverProd?: webpack.Configuration,
    serverDebug?: webpack.Configuration,
    clientDev?: webpack.Configuration,
    clientProd?: webpack.Configuration,
    clientDebug?: webpack.Configuration,
}

export type BuildTarget =
    | 'server'
    | 'client'

export type BuildEnvironment =
    | 'dev'
    | 'prod'
    | 'debug'

export type BuildParam =
    | BuildTarget
    | BuildEnvironment
    | 'complete'

export type StartParam =
    | 'fast'
    | 'watch'
    | 'prod'
    | 'debug'
    | 'client'
    | 'inspect'

export type WatchParam =
    | 'server'
    | 'fast'
    | 'client'
    | 'inspect'
