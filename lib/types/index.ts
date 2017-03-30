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

    /** root path of your application */
    BASE: string

    /** entry file for the client */
    CLIENT_ENTRY: string

    /** file for client polyfills if needed */
    CLIENT_POLYFILLS: string | false

    /** output directory for the client build */
    CLIENT_OUTPUT: string

    /** entry file for the server if applicable */
    SERVER_ENTRY: string

    /** output directory of the server */
    SERVER_OUTPUT: string

    /** URL prefix for all resources */
    PUBLIC_PATH: string
}

/** Use to override the application configuration */
export type BuildConfigOverride = Partial<BuildConfig>

export type BuildTarget =
    | 'server'
    | 'client'

export type BuildEnvironment =
    | 'dev'
    | 'prod'

export type BuildParam =
    | BuildTarget
    | BuildEnvironment

export type StartParam =
    | 'fast'
    | 'watch'
    | 'prod'
