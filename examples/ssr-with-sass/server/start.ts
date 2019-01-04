import { consoleLogger } from 'typescript-log'
import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { AppState } from '../common/App'
import { renderApp } from './render-app'

const log = consoleLogger()

createServer({
    log,
    middlewareHook: app => {
        // To enable SSR simply register the SSR middleware as the default
        // express handler.
        const ssrMiddleware = createSsrMiddleware<AppState>({
            app,
            errorLocation: '/error',
            pageNotFoundLocation: '/page-not-found',
            // You can access the current requests additional state through
            // the context key on the renderApp options object
            renderApp: ({ context }) => renderApp(context.ssrRequestProps),
            renderHtml,
            setupRequest: async () => ({
                // We can setup our initial app state in setupRequest
                // It can also be updated during each SSR pass
                config: { greeting: process.env.GREETING || 'Ola' },
            }),
            ssrTimeoutMs: 1000,
        })

        app.get('*', ssrMiddleware)
    },
})
