# Server side rendering

Project Watchtower also provides a large amount of server side rendering infrastructure which cannot be separated from the build side of things.

Server side rendering is quite a complex issue when you take into account local development, styles, data transfer and other issues.

Project-watchtower supports scss styles.

## Usage

By default the server entrypoint is `server/start.ts`, you can override this in `config/config.js` by setting `SERVER_ENTRY`.

**Note**: You _must_ have a logging express middleware registered before you register the server-side-rendering middleware. This need to add `req.log` to the express request.

### Gru

To allow the server to scale better watchtower works with Throng. You can use `START_DEBUG_MODE` to make sure you don't start multiple servers when trying to debug.

https://github.com/jakeginnivan/gru

```ts
// start.ts
import { gru } from 'gru'
import { startServer } from './index'
import { getMissingEnvVariables } from '../config/server'

const missingEnv = getMissingEnvVariables()

if (missingEnv.length) {
    throw new Error(`FATAL - Environment variables missing: ${missingEnv.join(', ')}`)
}

const numCpus = require('os').cpus().length

const singleNode = process.env.START_DEBUG_MODE === 'true'

if (singleNode) {
    startServer({ id: 1 })
} else {
    gru({
        master: () => {},
        start: (id: number) => startServer({ id }),
        workers: process.env.NODE_ENV === 'production' ? numCpus : 1,
        lifetime: Infinity,
    })
}
```

### createSsrMiddleware

To enable server side rendering, you just need to register the SSR middleware when creating your server

### Usage

```ts
import { createServer } from 'project-watchtower/lib/runtime/server'
import { createSsrMiddleware } from 'project-watchtower/lib/runtime/server/ssr'
import { configureStore, rootReducer, AppState } from 'store'
import { renderApp } from './render-server'
import { renderHtml } from 'server/render-html'

export const startServer = () => {
    // Do any server configuration here
    return createServer(app => {
        // Register additional routes here

        // If you want server side rendering support, register the ssr middleware
        app.get(
            '*',
            createSsrMiddleware<AppState>({
                app,
                ssrTimeoutMs: 1000,
                renderApp: ({ logger, store, renderContext, req }) => renderApp(renderContext),
                renderHtml: ({ head, renderMarkup, reduxState, assets, renderContext }) =>
                    renderHtml(head, renderMarkup, reduxState, assets),
                errorLocation: '/error',
                pageNotFoundLocation: '/page-not-found',
                createReduxStore: async (middlewares, _req) => {
                    const store = configureStore(rootReducer, {}, ...middlewares)

                    // Initialise the store here

                    return store
                },
            }),
        )
    })
}
```

#### Arguments

##### app: express.Express

This is your express app, we register additional middleware (helmet)

##### ssrTimeoutMs: number

Number of milliseconds before server side render times out

##### renderApp: (....) => JSX.Element

A function which gives you access to important state of the request and allows you to return a React element.

The `renderContext` allows you to let watchtower know that data has been loaded in this request.

**NOTE** You do _not_ have to include react routers `StaticRouter`. These are all configured and provided by watchtower SSR

If your application loads any data simply set `context.triggeredLoad = true`, this will ensure watchtower waits for you to call `context.completionNotifier.resolve({})` which will trigger another render.

###### Route Status

Within a `renderApp` render you can optionally set a statusCode using react-router.

##### createReduxStore: (....) => redux.Store

A function which creates the redux store for the request

### Express and async handlers

If a middleware happens to reject in an async handler it may be useful to catch. Here is a simple wrapper which does this if needed.

```ts
import { ErrorRequestHandler, RequestHandler } from 'express'

const isErrorHandler = (
    handler: RequestHandler | ErrorRequestHandler,
): handler is ErrorRequestHandler => handler.length === 4

/** Ensures express handlers which return promises are handled properly */
export const wrapAsyncHandler = (handler: RequestHandler | ErrorRequestHandler) => {
    if (isErrorHandler(handler)) {
        const errorTryHandler: ErrorRequestHandler = (err, req, res, next) =>
            Promise.resolve(handler(err, req, res, next)).catch(next)

        return errorTryHandler
    }

    const tryHandler: RequestHandler = async (req, res, next) =>
        Promise.resolve(handler(req, res, next)).catch(next)

    return tryHandler
}
```

## Tracking async work

Watchtower includes work tracking in redux, but is extensible. If you want watchtower to re-render after some asynchronous work is completed, simply call `context.promiseTracker.track()` during your appRender callback.

## Error handling

Watchtower handles server side rendering and data load failures for you, when the render pass throws watchtower will re-render using the provided `errorLocation` prop.

If you would like to render a 404 page instead, simply throw or reject a tracked promise with `new Status404Error()`
