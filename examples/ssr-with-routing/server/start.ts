import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../../lib/runtime/universal'
import { renderApp } from './render-app'
import { renderHtml } from './render-html'

const log = createConsoleLogger()

createServer({
    log,
    middlewareHook: app => {
        const ssrMiddleware = createSsrMiddleware<{}>({
            app,
            ssrTimeoutMs: 1000,
            renderApp,
            renderHtml,
            errorLocation: '/error',
            setupRequest: async () => ({}),
        })

        app.get('*', ssrMiddleware)
    },
})
