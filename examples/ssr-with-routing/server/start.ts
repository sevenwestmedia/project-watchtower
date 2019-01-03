import { consoleLogger } from 'typescript-log'
import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { renderApp } from './render-app'

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
