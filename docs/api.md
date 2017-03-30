# API

## CLI

Project Watchtower exposes the `project-watchtower` and `pwt` executables

### build

```
pwt build [<target>] [<environment>]
```

* `target`: server, client
* `environment`: dev, prod

Leaving the target out builds both server and client.

Leaving the environment out builds for production by default

### clean

```
pwt clean [<glob> ...]
```

Cleans the default paths `SERVER_OUTPUT`, `CLIENT_OUTPUT` as well as all `.js` and `.maps` files in `/client`, `/server` and `/common`. You can pass in additional glob patterns to be cleaned.

### explore-bundle

```
pwt explore-bundle
```

Opens the `webpack-bundle-analyzer` for the client production bundle.

### lint

```
pwt lint [<glob> ...]
```

Runs `tslint` and `sass-lint` against the project. By default all `.ts`/`.tsx` and all `.scss` files are checked. You can supply custom glob patterns instead. Note that they have to contain either `.ts` or `.scss` to be mapped to the correct linter.

### start

```
pwt start [watch] [fast] [prod]
```

*   `watch`: Enable watch mode and rebuild client after changes
*   `fast`: Disable TypeScript type checking for faster incremental builds
*   `prod`: Set `NODE_ENV` to `"production"`

### test

```
pwt test [<jest option> ...]
```


### Programmatic Usage

All CLI commands are available in `project-watchtower/lib/bin`. They take their parameters as strings:

```ts
import build from 'project-watchtower/lib/bin/build'

build('server', 'prod')
```

## JavaScript

All functional areas are available as a top-level import from the `project-watchtower` module. However, deep imports are preferred, which is especially important on the client where we don't want unnecessary code bundled up.

`project-watchtower/lib/build/build`

```ts
getWebpackConfig(
    target: BuildTarget,
    environment: BuildEnvironment
): webpack.Configuration
```

`project-watchtower/lib/build/merge`

```ts
default merge(...configs: webpack.Configuration[]) => webpack.Configuration[]
```

`project-watchtower/lib/clean`

```ts
default clean(paths: string | string[]) => Promise<any>
```

`project-watchtower/lib/client/dev`

```ts
cssHotReload()
```

`project-watchtower/lib/lint`

```ts
tslint(...paths: string[]): Promise<any>

sassLint(...paths: string[]): Promise<any>
```

`project-watchtower/lib/server/assets`

```ts
getAssetLocations(): Assets

getCssAssetHtml(): string

getJsAssetHtml(): string

addAssetsToHtml(html: string): string
```

`project-watchtower/lib/server/dev`

```ts
getHotReloadMiddleware() => express.RequestHandler[]

getDefaultHtmlMiddleware() => express.RequestHandler

openBrowser(port?: number)
```

`project-watchtower/lib/server/server`

```ts
createServer(
    middlewareHook?: (app: express.Express) => void,
    callback?: () => void,
) => express.Express
```

### Types

`project-watchtower/lib/types`

*   `Assets`: Mapping of webpack assets to file locations
*   `BuildConfig` / `BuildConfigOverride`: Basic configuration for the project
