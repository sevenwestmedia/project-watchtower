# Webpack build process

## Project structure

* config
    * webpack.[target].[environment].js: Override webpack configuration
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

## Building

```
pwt build [<target> <environment>]
```

## Customising

By default, Project Watchtower uses its own webpack configuration files. If you want to modify or extend them with custom options for you project, add configuration files to your project: `/config/webpack.<target>.<environment>.js`.

Example:

```ts
import { extendWebpackConfig, getDefaultWebpackConfig } from 'project-watchtower/lib/build'

const config = extendWebpackConfig(
    getDefaultWebpackConfig('server', 'prod'),
    {
        // ...
    }
)

export default config
```

If you want to change the default paths of the build process, you can add a `/config/paths.js` that overrides the paths used by the default webpack configuration:

```ts
import * as path from 'path'
import { PathsOverride } from 'project-watchtower/lib/types'

const customPaths: PathsOverride = {
    SERVER_OUTPUT: path.resolve(process.cwd(), 'dist')
}

export default customPaths
```

## Running

    pwt start [watch] [fast]

Starts the server, using the environment variables defined in `.env`

### Environment Variables

*   `NODE_ENV`: set to `"production"` or `"development` depending on the `prod` flag
*   `START_WATCH_MODE`: set to `"true"` by the `watch` flag
*   `START_FAST_MODE`: set to `"true"` by the `fast` flag
