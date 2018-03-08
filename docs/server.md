# Watchtower Express server
Watchtower can create your express server, it has a number of services provided.

The api is

``` ts
export const startServer = () => {
    return createServer(options?: {
        /** Early middleware hook is before static middleswares etc */
        earlyMiddlewareHook?: (app: express.Express) => void,
        middlewareHook?: (app: express.Express) => void,
        callback?: () => void,
        startListening?: boolean,
    })
}
```

## Services
### Logging
Watchtower will ensure there is a `.log` property on your express request. It will be done before any middleware hooks so you can overwrite it at any time.

Ensure that the log provided conforms to the Logger interface in watchtower. It is compatible with bunyan, winston etc so most loggers should be fine.
