# Building, Running and Debugging

## Building

```
pwt build [<target> <environment>]
```

## Customising

By default, Project Watchtower uses its own webpack configuration files. If you want to modify or extend them with custom options for you project, add configuration files to your project: `/config/webpack.<target>.<environment>.js`.

Example:

```ts
import { merge } from 'project-watchtower/lib/build'
import { base, clientBase, clientDev } from 'project-watchtower/lib/config'

// either extend one of the complete configurations
const extendedConfig = merge(
    clientDev,
    {
        // ...
    },
)

// or build your own with multiple building blocks
const config = merge(
    base,
    clientBase,
    {
        // ...
    },
)

export default config
```

If you want to change the default configuration of the build process, you can add a `/config/config.js` that overrides the settings used by the default webpack configuration:

```ts
import * as path from 'path'
import { BuildConfigOverride } from 'project-watchtower/lib/types'

const customConfig: BuildConfigOverride = {
    SERVER_OUTPUT: path.resolve(process.cwd(), 'dist')
}

export default customConfig
```

If you provide a `/config/config.ts` in TypeScript, make sure it is transpiled to JavaScript before any `pwt` command is run or any of Project Watchtower's middlewares are used. This can be done in the `prepare` script in your project's `package.json`. Project Watchtower will throw an error if it detects a TypeScript configuration file, but not the transpiled JavaScript artifact.

The complete default configuration is located in `project-watchtower/lib/runtime/config/config.ts`

See the [config documentation](./config.md) for an overview of the default project structure and configuration details.

## Running

    pwt start [watch] [fast] [debug] [prod]

Starts the server, using the environment variables defined in `.env`

### Environment Variables

*   `NODE_ENV`: set to `"production"` or `"development` depending on the `prod` flag - in the webpack bundles the values are hardcoded depending on which mode they were built in, so this is only relevant for third-party dependencies.
*   `START_WATCH_MODE`: set to `"true"` by the `watch` flag
*   `START_FAST_MODE`: set to `"true"` by the `fast` flag
*   `START_DEBUG_MODE`: set to `"true"` by the `debug` flag

If you want to use additional `process.env` variables in the **client** build, make sure you create a `.env` (for local) and `.env.default` file:

`.env`
> FOO=bar

`.env.default`
> FOO=

The values defined here are replaced in the client build. The server build still accesses its actual `process.env` object, only `process.env.NODE_ENV` is being replaced there.
Values that are present in the actual runtime environment at build time will _not_ be overridden by the ones defined in `.env` / `.env.default`. However, it is necessary to define all the environment variables in the `.env.default` file that are used in the client code.

### Hot Reloading

In development we use [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) and [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) to enable hot reloading. See the webpack docs under [https://webpack.js.org/guides/hot-module-replacement/](https://webpack.js.org/guides/hot-module-replacement/).

For CSS bundling we use the [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin), as the usual development fallback to [style-loader](https://github.com/webpack-contrib/style-loader) seems to have problems referncing fonts through file-loader, and we want to stay as close to production as we can. As it does not support hot reloading out of the box yet, the project has to include a manual helper method:

```jsx
import { cssHotReload } from 'project-watchtower/lib/runtime/client'

const render = () => {
    const App = require<{ default: React.ReactType }>('./components/App').default
    ReactDOM.render((
        <BrowserRouter>
            <App />
        </BrowserRouter>
    ), document.getElementById('root'))
}

render()

if (module.hot) {
    module.hot.accept('./components/App', () => {
        setTimeout(render)
    })

    cssHotReload()
}
```

For more information see [https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283](https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283)

## Debugging

As VS code has problems with sourcemaps that are generated during the runtime of the debugger, the process of debugging has to be split into a "build" and a "debug" phase. The "build" tasks are defined in `.vscode/tasks.json`, the "debug" configurations in `.vscode/launch.json` - they reference the "build" tasks as their `preLaunchTask`.

### Debug server build

In your `package.json`, add a shortcut script for project-watchtower:

```
"pwt": "pwt"
```

Add a debug configuration to `.vscode/launch.json`:

```
{
    "type": "node",
    "request": "launch",
    "name": "Debug server",
    "runtimeExecutable": "npm",
    "windows": {
        "runtimeExecutable": "npm.cmd"
    },
    "runtimeArgs": [
        "run-script",
        "pwt",
        "start",
        "debug"
    ],
    "port": 5858,
    "timeout": 60000,
    "sourceMaps": true,
    "outFiles": [
        "${workspaceRoot}/build/server.js",
        "${workspaceRoot}/build/*.js"
    ],
    "smartStep": true,
    "trace": "sm",
    "preLaunchTask": "build:debug"
}
```

Add the following task to `.vscode/tasks.json`:

```
{
    "taskName": "build:debug",
    "args": [
        "run",
        "pwt",
        "build",
        "debug"
    ]
}
```

### Debug tests

Debugging test cases with Jest currently only works by transpiling the tests to JavaScript and then running them due to a limitation in the `ts-jest` preprocessor.

In your `package.json`, add a shortcut script for project-watchtower and the TypeScript compiler:

```
"pwt": "pwt",
"tsc": "tsc",
```

Add a debug configuration to `.vscode/launch.json`:

```
{
    "type": "node",
    "request": "launch",
    "name": "Debug tests",
    "runtimeExecutable": "npm",
    "windows": {
        "runtimeExecutable": "npm.cmd"
    },
    "runtimeArgs": [
        "run-script",
        "pwt",
        "test",
        "debug"
    ],
    "port": 5858,
    "timeout": 30000,
    "sourceMaps": true,
    "smartStep": true,
    "trace": "sm",
    "preLaunchTask": "build:test:debug"
}
```

Depending on your TypeScript configuration you might have to add the compilation target directory as `outFiles`:

```
"outFiles": [
    "${workspaceRoot}/dist/**/*.js"
]
```

Add a task to compile your tests to JavaScript to `.vscode/tasks.json`:

```
{
    "taskName": "build:test:debug",
    "args": [
        "run",
        "tsc",
        "--",
        "-p",
        "./tsconfig-debug.json"
    ]
}
```
