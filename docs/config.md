# Configuration

## Default project structure

See the [build documentation](./build.md) for details on how to customise the project structure.

### Source locations

* config (optional. TypeScript has to be transpiled to JavaScript before building!)
    * webpack.[target].[environment].js: Override webpack configuration
    * config.js: Override default configuration
    * setup-tests.ts/js: Jest test setup
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

## Configuration file templates

Project Watchtower offers several templates for configuration files around tooling and building:

```

### TSLint: tslint.json

```json
{
    "extends": [
        "project-watchtower/presets/tslint"
    ]
}

```

### SASS-Lint .sass-lint.yml

The sass-lint configuration can be referenced from `package.json`

```json
{
    ...
    "sasslintConfig": "node_modules/project-watchtower/presets/sass-lint/.sass-lint.yml"
}
```
