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

/** Application configuration paths */
export interface Paths {
    BASE: string
    CLIENT_ENTRY: string
    CLIENT_OUTPUT: string
    CLIENT_POLYFILLS: string
    SERVER_ENTRY: string
    SERVER_OUTPUT: string
    PUBLIC_PATH: string
}

/** Use to override the application configuration paths */
export type PathsOverride = Partial<Paths>

export type BuildTarget =
    | 'server'
    | 'client'

export type BuildEnvironment =
    | 'dev'
    | 'prod'
    | 'base'

export type BuildParam =
    | BuildTarget
    | BuildEnvironment

export type StartParam =
    | 'fast'
    | 'watch'
    | 'prod'
