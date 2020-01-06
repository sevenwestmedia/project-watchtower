# CLI

Project Watchtower exposes the `project-watchtower` and `pwt` executables

### build

```
pwt build [<target>] [<environment>] [-p <project dir>]
```

-   `target`: server, client
-   `environment`: dev, debug, prod

Leaving the target out builds both server and client.

Leaving the environment out builds for production by default.

### clean

```
pwt clean [<glob> ...] [-p <project dir>]
```

Cleans the default paths `SERVER_OUTPUT`, `CLIENT_OUTPUT` as well as all `.js` and `.maps` files in `/client`, `/server` and `/common`. You can pass in additional glob patterns to be cleaned.

### explore-bundle

```
pwt explore-bundle [disableHoisting] [-p <project dir>]
```

Opens the `webpack-bundle-analyzer` for the client production bundle.

-   `disableHoisting`: Disable scope hosting to identify where all the modules are coming from

### start

```
pwt start [watch] [prod] [debug] [client] [-p <project dir>]
```

-   `watch`: Enable watch mode and rebuild client after changes
-   `prod`: Set `NODE_ENV` to `"production"`
-   `debug`: Start node process with `--inspect` for debugging and performance measurement in _chrome://inspect_
-   `client`: Start internal server that serves only the client

### watch

```
pwt watch [server] [client] [debug] [-p <project dir>]
```

Builds the server in dev mode, then watches and rebuilds the client

-   `server`: Also watches and rebuilds the server
-   `client`: Only run client without a server
-   `debug`: Start node process with `--inspect` for debugging and performance measurement in _chrome://inspect_
