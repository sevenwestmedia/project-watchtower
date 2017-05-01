# Webpack build process

## Building

```
pwt build [<target> <environment>]
```

## Customising

By default, Project Watchtower uses its own webpack configuration files. If you want to modify or extend them with custom options for you project, add configuration files to your project: `/config/webpack.<target>.<environment>.js`.

Example:

```ts
import { merge } from 'project-watchtower/lib/build'
import baseConfig from 'project-watchtower/lib/config/webpack.base'
import clientConfig from 'project-watchtower/lib/config/webpack.client'
import clientDevConfig from 'project-watchtower/lib/config/webpack.client.dev'

// either extend one of the complete configurations
const extendedConfig = merge(
    clientDevConfig,
    {
        // ...
    },
)

// or build your own with multiple building blocks
const config = merge(
    baseConfig,
    clientConfig,
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

The complete default configuration is located in `project-watchtower/lib/config/config`

See the [config documentation](./config.md) for an overview of the default project structure and configuration details.

## Running

    pwt start [watch] [fast] [debug]

Starts the server, using the environment variables defined in `.env`

### Environment Variables

*   `NODE_ENV`: set to `"production"` or `"development` depending on the `prod` flag 
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

## Debugging

### Debug server build

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
        "start:debug"
    ],
    "port": 5858,
    "timeout": 90000,
    "sourceMaps": true,
    "outFiles": [
        "${workspaceRoot}/build/server.js",
        "${workspaceRoot}/build/*.js"
    ],
    "smartStep": true,
    "trace": "sm"
},
```

Add the following script to your `package.json`:

```
"start:debug": "pwt build server debug && pwt start debug"
```

### Debug tests

Debugging test cases with Jest currently only works by transpiling the tests to JavaScript and then running them due to a limitation in the `ts-jest` preprocessor.

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
        "test:debug"
    ],
    "port": 5858,
    "timeout": 30000,
    "sourceMaps": true
}
```

Depending on your TypeScript configuration you might have to add the compilation target directory as `outFiles`:

```
"outFiles": [
    "${workspaceRoot}/dist/**/*.js"
]
```

Add the following script to your `package.json` (with the appropriate command to transpile your TypeScript sources):

```
"test:debug": "tsc && pwt test debug"
```
