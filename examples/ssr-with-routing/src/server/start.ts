import { consoleLogger } from 'typescript-log'
import { renderApp } from './render-app'
import { createServer, createSsrMiddleware, renderHtml } from '@project-watchtower/server'

const log = consoleLogger()

createServer({
    log,
    middlewareHook: app => {
        const ssrMiddleware = createSsrMiddleware<{}>({
            app,
            errorLocation: '/error',
            pageNotFoundLocation: '/page-not-found',
            renderApp,
            renderHtml,
            setupRequest: async () => ({}),
            ssrTimeoutMs: 1000,
        })

        app.get('*', ssrMiddleware)
    },
})
