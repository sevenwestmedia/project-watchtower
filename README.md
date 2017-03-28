# Project Watchtower

A unified basis for web applications

## Webpack build process

### Project structure

* config
    * webpack.[target].[environment].js: Override webpack configuration
* client
    * index.tsx: Client entry file
    * polyfills.ts: Polyfills (optional)
* server
    * start.ts: Server entry file

#### Output locations

* build: Server build output directory
    * *server.js*: Main file generated for server
    * ...
* public
    * assets: Client build output directory
        * main.js (hashed in production build)
        * vendor.js (hashed in production build)
        * ...
* assets.json: Mapping to the location of the generated assets

### Building

    pwt build [<target> <environment>]

* `target`: server, client
* `environment`: dev, prod

### Customising

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

*   `watch`: Enable watch mode and rebuild client after changes
*   `fast`: Disable TypeScript type checking for faster incremental builds



## Development of Project Watchtower

Linking Project Watchtower into projects with `yarn link` unfortunately does not work. Here's one way to test unpublished versions:

Build and pack Project Watchtower into a `.tgz` file:
```
npm pack
```

In the project you want to use it, add the `.tgz` file as a dependency:
```
yarn add file:/../project-watchtower-0.0.1.tgz
```

To update:
```
yarn remove project-watchtower
yarn cache clean
yarn add file:/../project-watchtower-0.0.1.tgz
```
