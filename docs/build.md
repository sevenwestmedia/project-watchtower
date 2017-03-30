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
import baseConfig from 'project-watchtower/lib/build/config/webpack.base'
import clientConfig from 'project-watchtower/lib/build/config/webpack.client'
import clientDevConfig from 'project-watchtower/lib/build/config/webpack.client.dev'

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

The complete default configuration is located in `project-watchtower/lib/build/config/config`

See the [config documentation](./config.md) for an overview of the default project structure.

## Running

    pwt start [watch] [fast]

Starts the server, using the environment variables defined in `.env`

### Environment Variables

*   `NODE_ENV`: set to `"production"` or `"development` depending on the `prod` flag 
*   `START_WATCH_MODE`: set to `"true"` by the `watch` flag
*   `START_FAST_MODE`: set to `"true"` by the `fast` flag
