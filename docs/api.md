# JavaScript API

## Programmatic Usage of CLI commands

All CLI commands are available in `project-watchtower/lib/bin`. They take their parameters as strings:

```ts
import build from 'project-watchtower/lib/bin/build'

build('server', 'prod')
```

## Functions, Config and Middleware

All functional areas are available as a top-level import from the `project-watchtower` module. However, deep imports are preferred, which is especially important on the client where we don't want unnecessary code bundled up.

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

```ts
getAssetLocations(): Assets

getCssAssetHtml(): string

getJsAssetHtml(): string

addAssetsToHtml(html: string): string

createServer(
    middlewareHook?: (app: express.Express) => void,
    callback?: () => void,
) => express.Express

getDefaultHtmlMiddleware() => express.RequestHandler
```

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
base: webpack.Configuration
clientBase: webpack.Configuration
clientDev: webpack.Configuration
clientDebug: webpack.Configuration
clientProd: webpack.Configuration
serverDev: webpack.Configuration
serverDebug: webpack.Configuration
serverProd: webpack.Configuration
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
getHotReloadMiddleware() => express.RequestHandler[]

openBrowser(port?: number)
```

`project-watchtower/lib/stats`

```ts
measureBuildStats() => Promise<BuildMetrics>

writeBuildStats(metrics: BuildMetrics) => Promise<void>

default measureAndWriteBuildStats() => Promise<void>
```

### Types

`project-watchtower/lib/types`

*   `Assets`: Mapping of webpack assets to file locations
*   `BuildConfig` / `BuildConfigOverride`: Basic configuration for the project
