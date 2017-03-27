# Project Watchtower

A unified basis for web applications

## Webpack build process

### Project structure


* config
    * webpack.[target].[environment].js: Override webpack configuration
* client
    * index.tsx: Client entry file
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
* assets.json: 

### Building

    project-watchtower build [<target> <environment>]

Targets: server, client

Environments: dev, prod

By default, Project Watchtower uses its own webpack configuration files. If you want to modify or extend them with custom options for you project, add configuration files to your project: `/config/webpack.<target>.<environment>.js`.

Example:

```ts
import { extendWebpackConfig, clientDevConfig } from 'project-watchtower/lib/build'

const config = extendWebpackConfig(
    clientDevConfig,
    {
        // ...
    }
)

export default config
```
