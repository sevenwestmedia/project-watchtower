# Server side rendering
Project Watchtower also provides a large amount of server side rendering infrastructure which cannot be separated from the build side of things.

Server side rendering is quite a complex issue when you take into account local development, styles, data transfer and other issues.

Project-watchtower supports both glamor and scss styles.

## Usage
By default the server entrypoint is `server/start.ts`, you can override this in `config/config.js` by setting `SERVER_ENTRY`.

**Note**: You *must* have a logging express middleware registered before you register the server-side-rendering middleware. This need to add `req.log` to the express request.

### Throng
To allow the server to scale better watchtower works with Throng. You can use `START_DEBUG_MODE` to make sure you don't start multiple servers when trying to debug.

``` ts
// start.ts
import * as throng from 'throng'
import { startServer } from './index'
import { getMissingEnvVariables } from '../config/server'

const missingEnv = getMissingEnvVariables()

if ( missingEnv.length ) {
    throw new Error(`FATAL - Environment variables missing: ${missingEnv.join(', ')}`)
}

// tslint:disable-next-line no-var-requires
const numCpus = require('os').cpus().length

const singleNode = process.env.START_DEBUG_MODE === 'true'

if (singleNode) {
    startServer({ id: 1 })
} else {
    throng({
        master: () => {},
        start: (id: number) => startServer({ id }),
        workers: process.env.NODE_ENV === 'production' ? numCpus : 1,
        lifetime: Infinity,
    })
}
```

### createSsrMiddleware
To enable server side rendering, you just need to register the SSR middleware.

#### Arguments
##### app: express.Express
This is your express app, we register additional middleware (helmet)

##### ssrTimeoutMs: number
Number of milliseconds before server side render times out

##### renderApp: (....) => JSX.Element
A function which gives you access to important state of the request and allows you to return a React element.

The `renderContext` allows you to let watchtower know that data has been loaded in this request. Simply 

##### createReduxStore: (....) => redux.Store
A function which creates the redux store for the request
