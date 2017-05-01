# API

## CLI

Project Watchtower exposes the `project-watchtower` and `pwt` executables

### build

```
pwt build [complete] [<target>] [<environment>]
```

* `complete`: Runs clean, lint and test before building
* `target`: server, client
* `environment`: dev, debug, prod

Leaving the target out builds both server and client.

Leaving the environment out builds for production by default.

### clean

```
pwt clean [<glob> ...]
```

Cleans the default paths `SERVER_OUTPUT`, `CLIENT_OUTPUT` as well as all `.js` and `.maps` files in `/client`, `/server` and `/common`. You can pass in additional glob patterns to be cleaned.

### coverage

```
pwt coverage [<jest option> ...]
```

### explore-bundle

```
pwt explore-bundle
```

Opens the `webpack-bundle-analyzer` for the client production bundle.

### lint

```
pwt lint [tslint] [sass-lint] [<glob> ...]
```

Runs `tslint` and/or `sass-lint` against the project.

*   `tslint`: Only run tslint
*   `sass-lint`: Only run sass-lint

By default all `.ts`/`.tsx` and all `.scss` files are checked. You can supply custom glob patterns instead. Note that they have to contain either `.ts` or `.scss` to be mapped to the correct linter if both linters are run in the same command.

### start

```
pwt start [watch] [fast] [prod]
```

*   `watch`: Enable watch mode and rebuild client after changes
*   `fast`: Disable TypeScript type checking for faster incremental builds
*   `prod`: Set `NODE_ENV` to `"production"`

### stats

```
pwt stats
```

Measures build metrics and saves them to `build-stats.csv`

Example:

```
bundle_size_total,bundle_size_main,bundle_size_vendor,bundle_size_css,ssr_document_size,ssr_loadtime
166.7,0.5,166.3,0.1,0.5,3
```

### test

```
pwt test [debug] [<jest option> ...]
```

*   `debug`: Runs the tests in debugging mode to use breakpoints. **This is incompatible with ts-jest so all TypeScript test files will have to be compiled to JavaScript first!**

### watch

```
pwt watch [server] [fast]
```

Builds the server in dev mode, then watches and rebuilds the client

* `server`: Also watches and rebuilds the server
* `fast`: Disable TypeScript type checking for faster incremental builds

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
