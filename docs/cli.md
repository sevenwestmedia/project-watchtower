# CLI

Project Watchtower exposes the `project-watchtower` and `pwt` executables

### build

```
pwt build [complete] [<target>] [<environment>] [-p <project dir>]
```

* `complete`: Runs clean, lint and test before building
* `target`: server, client
* `environment`: dev, debug, prod

Leaving the target out builds both server and client.

Leaving the environment out builds for production by default.

### clean

```
pwt clean [<glob> ...] [-p <project dir>]
```

Cleans the default paths `SERVER_OUTPUT`, `CLIENT_OUTPUT` as well as all `.js` and `.maps` files in `/client`, `/server` and `/common`. You can pass in additional glob patterns to be cleaned.

### coverage

```
pwt coverage [-p <project dir>] [<jest option> ...]
```

### explore-bundle

```
pwt explore-bundle [disableHoisting] [-p <project dir>]
```

Opens the `webpack-bundle-analyzer` for the client production bundle.

*   `disableHoisting`: Disable scope hosting to identify where all the modules are coming from

### lint

```
pwt lint [tslint] [sass-lint] [-p <project dir>] [<glob> ...]
```

Runs `tslint` and/or `sass-lint` against the project.

*   `tslint`: Only run tslint
*   `sass-lint`: Only run sass-lint

By default all `.ts`/`.tsx` and all `.scss` files are checked. You can supply custom glob patterns instead. Note that they have to contain either `.ts` or `.scss` to be mapped to the correct linter if both linters are run in the same command.

### start

```
pwt start [watch] [fast] [prod] [debug] [inspect] [client] [-p <project dir>]
```

*   `watch`: Enable watch mode and rebuild client after changes
*   `fast`: Disable TypeScript type checking for faster incremental builds
*   `prod`: Set `NODE_ENV` to `"production"`
*   `debug`: Start node process in debug mode
*   `inspect`: Start node process with `--inspect` for debugging and performance measurement in *chrome://inspect*
*   `client`: Start internal server that serves only the client

### stats

```
pwt stats [verbose] [-p <project dir>]
```

Measures build metrics and saves them to `build-stats.csv`

*   `verbose`: Output the server console logging when running the stats

Example:

```
bundle_size_total,bundle_size_main,bundle_size_vendor,bundle_size_css,home_ssr_document_size,home_ssr_loadtime,home_first_meaningful_paint,home_speed_index,home_time_to_interactive
28.6,0.2,28.4,0.1,0.0,2,270,284,275
```

In addition the stats are output on the console for TeamCity:

```
##teamcity[buildStatisticValue key='${key}' value='${value}']
```

Stats:

*   `bundle_size_total`: Total size of all JS bundles (KB)
*   `bundle_size_main`: Size of the main JS bundle (KB)
*   `bundle_size_vendor`: Size of the vendor JS bundle (KB)
*   `bundle_size_css`: Size of the CSS bundle (KB)
*   `<PAGE>_ssr_document_size`: Size of the server-side rendered homepage document (KB)
*   `<PAGE>_ssr_dom_size`: Number of DOM elements after server-side rendering
*   `<PAGE>_ssr_loadtime`: Average load time of the server-side rendered homepage document (ms)
*   `<PAGE>_first_meaningful_paint`: First meaningful paint through lighthouse (ms)
*   `<PAGE>_speed_index`: Lighthouse speed index (lower is better)
*   `<PAGE>_time_to_interactive`: Time to interactive through lighthouse (ms)
*   `<PAGE>_consistently_interactive`: Time until the page is consistently interactive through lighthouse (ms)
*   `<PAGE>_dom_size`: Number of DOM elements on the page
*   `<PAGE>_perf_score`: Overall performance score (0-100)

For the lighthouse values to be generated, Google Chrome has to be installed on the machine running the tests.
If Google Chrome is not installed, the lighthouse stats will not be included.

Stats generation can be customised through configuration variables:

* `STATS_PAGES` defines the pages that should be measured, default `{ home: '/' }` will generate stats like `home_ssr_document_size`
* `STATS_ENV` defines additional environment variables for the server so it can set up a stable and predictable environment to measure the stats

On build servers with access to Google Chrome through a Docker container, the following environment variables are used:

*   `CHROME_REMOTE_DEBUGGING_PORT`: Port that the lighthouse stats try to connect to a Chrome instance
*   `JENKINS_URL`: Used to detect a Jenkins build server
*   `STATS_SERVER_ADDRESS`: Host name or IP address of container that hosts the Chrome installation
*   `TEAMCITY_VERSION`: Used to detect a TeamCity build server

### test

```
pwt test [debug] [-p <project dir>] [<jest option> ...]
```

*   `debug`: Runs the tests in debugging mode to use breakpoints. **This is incompatible with ts-jest so all TypeScript test files will have to be compiled to JavaScript first!**

### watch

```
pwt watch [server] [client] [fast] [inspect] [-p <project dir>]
```

Builds the server in dev mode, then watches and rebuilds the client

*   `server`: Also watches and rebuilds the server
*   `fast`: Disable TypeScript type checking for faster incremental builds
*   `client`: Only run client without a server
*   `inspect`: Start node process with `--inspect` for debugging and performance measurement in *chrome://inspect*
