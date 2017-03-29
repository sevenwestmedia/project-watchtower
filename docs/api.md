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

### start

```
pwt start [watch] [fast]
```

*   `watch`: Enable watch mode and rebuild client after changes
*   `fast`: Disable TypeScript type checking for faster incremental builds

### Programmatic Usage

All CLI commands are available in `project-watchtower/lib/bin`. They take their parameters as strings:

```ts
import build from 'project-watchtower/lib/bin/build'

build('server', 'prod')
```

## JavaScript

`project-watchtower/lib/build`

```ts
getAssetLocations(): Assets
extendWebpackConfig(
    baseConfig: webpack.Configuration,
    newConfig: Partial<webpack.Configuration>,
): webpack.Configuration
getWebpackConfig(target, environment): webpack.Configuration
getDefaultWebpackConfig(target, environment): webpack.Configuration
```

### Types

`project-watchtower/lib/types`

*   `Assets`: Mapping of webpack assets to file locations
*   `Paths` / `PathsOverride`: Basic paths configuration for the project
