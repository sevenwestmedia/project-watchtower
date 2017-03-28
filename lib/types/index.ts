export interface Assets {
    vendor: {
        js: string
    }
    main: {
        js: string
        css: string
    }
}

export interface Paths {
    BASE: string,
    CLIENT_ENTRY: string,
    CLIENT_OUTPUT: string,
    CLIENT_POLYFILLS: string,
    SERVER_ENTRY: string,
    SERVER_OUTPUT: string,
    PUBLIC_PATH: string,
}

export type PathsOverride = Partial<Paths>
