# Configuration

## Default project structure

See the [build documentation](./build.md) for details on how to customise the project structure.

### Source locations

* config (optional. TypeScript has to be transpiled to JavaScript before building!)
    * webpack.[target].[environment].js: Override configuration
    * config.js: Override default configuration
    * setup-tests.ts/js: Jest test setup
* common: Application code
* client
    * index.tsx: Client entry file
    * polyfills.ts: Polyfills (optional)
* server
    * start.ts: Server entry file

### Output locations

* build: Server build output directory
    * *server.js*: Main file generated for server
    * ...
* public
    * assets: Client build output directory
        * main.js (hashed in production build)
        * vendor.js (hashed in production build)
        * ...
* assets.json: Mapping to the location of the generated assets
* build-stats.csv: Generated build metrics
* .env: Environment variables
* .env.default: Definition of environment variables

## Override default configuration

Options for the file  `/config/config.js` (usage explained in the [build documentation](./build.md))

```ts
export interface BuildConfig {

    /** root path of your application */
    BASE: string

    /** set to false if the application is serverless */
    HAS_SERVER: boolean,

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

    /** directory that is served as static resources */
    SERVER_PUBLIC_DIR: string | false

    /** if true, no hash is added to the generated assets */
    STATIC_RESOURCE_NAMES: boolean

    /** List paths to exclude from linting */
    LINT_EXCLUDE: string[]

    /** Default port for the server (when process.env.PORT is not set) */
    PORT: number

    /** Paths where modules are resolved */
    MODULE_PATHS: string[]

    /** Regular expression of paths to be ignored in watch mode */
    WATCH_IGNORE: RegExp

    /** Autoprefixer browser compatibilty  */
    CSS_AUTOPREFIXER: string[]

}
```

Default configuration:

```ts
{
    BASE: `${root}`,
    HAS_SERVER: true,
    CLIENT_ENTRY: `${root}/client/index.tsx`,
    CLIENT_OUTPUT: `${root}/public/assets`,
    CLIENT_POLYFILLS: `${root}/client/polyfills.ts`,
    SERVER_ENTRY: `${root}/server/start.ts`,
    SERVER_OUTPUT: `${root}/build`,
    PUBLIC_PATH: '/assets/',
    SERVER_PUBLIC_DIR: `${root}/public`,
    STATIC_RESOURCE_NAMES: false,
    LINT_EXCLUDE: [],
    PORT: 3000,
    MODULE_PATHS: [
        `${root}`,
        `${root}/node_modules`,
        `${root}/common`,
    ],
    WATCH_IGNORE: /node_modules(?!.+swm-component-library)/,
}
```

## Configuration file templates

Project Watchtower offers several templates for configuration files around tooling and building:

```

### TSLint: tslint.json

```json
{
    "extends": [
        "project-watchtower/presets/tslint"
    ]
}

```

### SASS-Lint .sass-lint.yml

The sass-lint configuration can be referenced from `package.json`

```json
{
    ...
    "sasslintConfig": "node_modules/project-watchtower/presets/sass-lint/.sass-lint.yml"
}
```
