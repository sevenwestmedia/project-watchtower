# Changelog

## vNext


## v0.5.3 (2017-07-07)

* Support testing lazy-loaded components by mocking `bundle-loader`
* Support consuming the component library as TypeScript
* Add hooks to easily extend the webpack build configuration

## v0.5.2 (2017-06-20)

* Output test results and coverage to TeamCity when run

## v0.5.1 (2017-06-14)

* Fix: `getHotReloadMiddleware()` no longer serves `public/index.html` on / route if it exists

## v0.5.0 (2017-06-13)

* **BREAKING** Default configuration changes (SWM-2857)
    * CLIENT_OUTPUT `/public/assets` -> `/build/client`
    * SERVER_OUTPUT `/build` -> `build/server`
    * PUBLIC_PATH `/assets` -> `/`
* Applications with a server can now run client-only
    * Added `pwt start client`
    * Added `pwt watch client`
* Added `getAbsoluteAssetPath()`

## v0.4.0 (2017-06-07)

* **BREAKING** Upgrade to jest 20
* **BREAKING** Refactor components into `/lib/runtime` that can be safely imported when project-watchtower is installed as a `devDependency`
    * `/lib/client/dev` -> `/lib/runtime/client`
    * `/lib/config/config` -> `/lib/runtime/config`
    * `/lib/server/assets` -> `/lib/runtime/server`
    * `/lib/server/dev getDefaultHtmlMiddleware()` -> `/lib/runtime/server`
    * `/lib/server/server` -> `/lib/runtime/server`

## v0.3.3 (2017-06-02)

* Fix failed webpack builds hanging on the build servers

## v0.3.2 (2017-06-02)

* The lighthouse stats now use a provided Chrome instance on build servers using the `CHROME_REMOTE_DEBUGGING_PORT` and `STATS_SERVER_ADDRESS` environment variables
* Fix: Fail webpack build if there are TypeScript errors

## v0.3.1 (2017-05-31)

* **BREAKING** Rename `SERVER_BUNDLE_EXTERNALS` configuration to `SERVER_INCLUDE_IN_BUNDLE`

## v0.3.0 (2017-05-30) [unpublished]

* Fix: Make sure process exits after command was executed
* Fix: Make sure all child processes are killed when exiting process
* Fix: `NODE_ENV` is set to `"production"` when running `pwt stats`
* Fix: Lighthouse no longer fails completely when some stats cannot be obtained
* Add `SERVER_BUNDLE_EXTERNALS` configuration to specify which external modules should be included in the server bundle
* Make parts of project-watchtower work within a webpack bundle so it can be installed as devDependency

## v0.2.4 (2017-05-23)

* Fix: Find available port and add timeouts for server stats
* Fails execution if `/config/config.ts` is found, but has not been compiled to `/config/config.js`. This would otherwise lead to more random errors as previously project-watchtower would just fall back to its default configuration.

## v0.2.3 (2017-05-19)

* Fix initial asset locations
* Fix: Only clean before testing when not in debug mode to prevent deleting transpiled artifacts

## v0.2.2 (2017-05-15)

* Fix total bundle size stats after paths change

## v0.2.1 (2017-05-11)

* Fix `pwt build debug`
* Add client debug configuration

## v0.2.0 (2017-05-11)

* Add `debug` environment for `pwt build server debug`
* Add `pwt start debug` and `START_DEBUG_MODE` environment flag
* Add `WATCH_IGNORE` configuration
* Add lighthouse build stats for first meaningful paint and time to interactive
* Add `CSS_AUTOPREFIXER` configuration
* Add TeamCity build stats output
* **BREAKING** Add `STATS_PAGES` configuration to allow multiple pages to be assessed for build stats. The stats will be prefixed by the page's name
* Add `STATS_ENV` configuration to set up a special environment for measuring build stats
* **BREAKING** Add `ASSETS_PATH_PREFIX` configuration and set it to `/static`, which changes the default location of the JS and CSS bundles (JS `/ => /static/js`, CSS `/css => /static/css`)

## v0.1.3 (2017-05-01)

* Add `pwt test debug` for debugging Jest tests

## v0.1.2 (2017-04-26)

* Use `webpack-dotenv-plugin` to allow environment variables to be defined in the actual runtime environment during build

## v0.1.1 (2017-04-24)

* Replace `process.env` variables in client build with the values defined in the `.env` file
* Add `raw-loader` for `.md` files
* Add `html-webpack-plugin` to client build if `<SERVER_PUBLIC_DIR>/index.html` exists
