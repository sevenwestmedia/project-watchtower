# JavaScript API

## Programmatic Usage of CLI commands

All CLI commands are available in `project-watchtower/lib/bin`. They take their parameters as strings:

```ts
import build from 'project-watchtower/lib/bin/build'

build('server', 'prod')
```

## React Components

### PageLifecycleProvider
See [Page Lifecycle Provider](./page-lifecycle-provider.md)

## Functions, Config and Middleware

All functional areas are available as a top-level import from the `project-watchtower` module. However, deep imports are preferred, which is especially important on the client where we don't want unnecessary code bundled up (like WebPack/TypeScript, you probably don't want them in your client bundle in production).

The webpack build bundles project-watchtower itself into the server bundle, so it is not required to be present in `node_modules` to run the server. Many functions that are important for development, however, depend on external dependencies that are not included in the webpack bundle and would throw an error if imported statically during production. Components and functions in `/lib/runtime` are safe to statically import in production builds, even if project-watchtower is installed as a `devDependency`, because they have no external dependencies other than the ones listed as required for production in the README. All other functions have to be imported dynamically for development only:

```ts
// safe to statically import
import { getAssetLocations } from 'project-watchtower/lib/runtime/server'

// only safe to use during development
if (process.env.START_WATCH_MODE) {
    const { getHotReloadMiddleware } = require('project-watchtower/lib/server')
    app.use(getHotReloadMiddleware())
}
```

### Safe to import in production

`project-watchtower/lib/runtime/client`

```ts
cssHotReload()
```

`project-watchtower/lib/runtime/config`

```ts
default CONFIG // application configuration
```

`project-watchtower/lib/runtime/server`
These dependencies are safe to import into a node server

``` ts
import { createServer } from 'project-watchtower/lib/runtime/server'
import { createSsrMiddleware } from 'project-watchtower/lib/runtime/server/ssr'
import { configureStore, rootReducer, AppState } from 'store'
import { renderApp } from './render-server'
import { renderHtml } from 'server/render-html'

export const startServer = () => {
    return createServer(options?: {
        /** Early middleware hook is before static middleswares etc */
        earlyMiddlewareHook?: (app: express.Express) => void,
        middlewareHook?: (app: express.Express) => void,
        callback?: () => void,
        startListening?: boolean,
    })
}

```

`project-watchtower/lib/runtime/server/ssr`
See [Server Side Rendering](./server-side-rendering.md)


```ts
getAssetLocations(): Assets

getAbsoluteAssetPath(asset: string): string

createServer(options?: {
    /** Early middleware hook is before static middleswares etc */
    earlyMiddlewareHook?: (app: express.Express) => void,
    middlewareHook?: (app: express.Express) => void,
    callback?: () => void,
    startListening?: boolean,
}) => express.Express

getDefaultHtmlMiddleware() => express.RequestHandler
```

`project-watchtower/lib/runtime/universal`

Exposes a number of utilities and helpers which are safe to use on the server or client

### Import for dev only

`project-watchtower/lib/build`

```ts
getWebpackConfig(
    target: BuildTarget,
    environment: BuildEnvironment
): webpack.Configuration

merge(...configs: webpack.Configuration[]) => webpack.Configuration[]
```

`project-watchtower/lib/clean`

```ts
default clean(paths: string | string[]) => Promise<any>
```

`project-watchtower/lib/config`

```ts
base: (buildConfig: BuildConfig) => webpack.Configuration
clientBase: (buildConfig: BuildConfig) => webpack.Configuration
clientDev: (buildConfig: BuildConfig) => webpack.Configuration
clientDebug: (buildConfig: BuildConfig) => webpack.Configuration
clientProd: (buildConfig: BuildConfig) => webpack.Configuration
serverDev: (buildConfig: BuildConfig) => webpack.Configuration
serverDebug:(buildConfig: BuildConfig) =>  webpack.Configuration
serverProd: (buildConfig: BuildConfig) => webpack.Configuration
devBase: webpack.Configuration
prodBase: webpack.Configuration
```

`project-watchtower/lib/lint`

```ts
tslint(...paths: string[]): Promise<any>

sassLint(...paths: string[]): Promise<any>
```

`project-watchtower/lib/server`

```ts
getHotReloadMiddleware(buildConfig: BuildConfig) => express.RequestHandler[]

openBrowser(buildConfig: BuildConfig, port?: number)
```

`project-watchtower/lib/stats`

```ts
measureBuildStats() => Promise<BuildMetrics>

writeBuildStats(metrics: BuildMetrics) => Promise<void>

measureAndWriteBuildStats() => Promise<void>
```

### Types

`project-watchtower/lib/types`

*   `Assets`: Mapping of webpack assets to file locations
*   `BuildConfig` / `BuildConfigOverride`: Basic configuration for the project
