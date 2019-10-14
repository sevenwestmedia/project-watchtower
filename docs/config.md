# Configuration and Structure

## Default project structure

See the [build documentation](./build.md) for details on how to customise the project structure.

### Source locations

-   config (optional. TypeScript has to be transpiled to JavaScript before building!)
    -   webpack.[target].[environment].js: Override/replaces configuration
    -   webpack-hooks.js: Add webpack options
    -   config.js: Override default configuration
    -   setup-tests.ts/js: Jest test setup
-   common: Application code
-   client
    -   index.tsx: Client entry file
    -   polyfills.ts: Polyfills (optional)
-   public: Public directory for assets that aren't bundled with the application
    -   index.html: HTML template for client-only mode
-   server
    -   start.ts: Server entry file
-   .env: Environment variables
-   .env.default: Definition of environment variables

#### Webpack hooks

To add additional config (in addition to the default webpack config, you can specify a hooks file)

The interface looks like this:

```ts
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
```

### Output locations

-   build/client: Client build output directory
    -   static
        -   js
            -   main.js (hashed in production build)
        -   css
            -   main.css (hashed in production build)
        -   media
        -   fonts
-   build/server: Server build output directory
    -   _server.js_: Main file generated for server
    -   ...
    -   index.html
-   assets.json: Mapping to the location of the generated assets
-   build-stats.csv: Generated build metrics

## Override default configuration

Options for the file `/config/config.js` (usage explained in the [build documentation](./build.md))

```ts
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

    /** set to false if the application is serverless */
    HAS_SERVER: boolean

    /** Default port for the server (when process.env.PORT is not set) */
    PORT: number

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
```

Default configuration:

```ts
{
    ASSETS_PATH_PREFIX: 'static/',
    ASSETS_ROOT: path.resolve(root),
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'dist'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    HAS_SERVER: true,
    PUBLIC_PATH: '/',
    DEV_SERVER_PORT: 3000,
    /** if true, all externals will be bundled */
    SERVER_BUNDLE_ALL: false,
    SERVER_INCLUDE_IN_BUNDLE: [
        'project-watchtower',
    ],
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'dist'),
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
}
```
