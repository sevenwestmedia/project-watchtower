import { consoleLogger } from 'typescript-log'
import { createServer } from '../../../lib/runtime/server'

const log = consoleLogger()

// tslint:disable-next-line:no-empty-interface
export interface AppState {}

// Use watchtower to create an express server
createServer({
    log,
    // Use the middleware hook to register your own middleware
    middlewareHook: app => {
        // Watchtower has setup static file routes by this point

        // Add your own routes/middleswares
        app.get('/example-route', (_, res) => res.send('<p>Example server route</p>'))

        // Watchtower has setup fallback routes to serve your client app for all other routes
    },
})
