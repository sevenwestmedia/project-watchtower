import { createServer } from '../../lib/runtime/server'
import { createSsrMiddleware } from '../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../lib/runtime/universal'
import { renderApp } from './render-app'
import { renderHtml } from './render-html'

const log = createConsoleLogger()

// tslint:disable-next-line:no-empty-interface
export interface AppState {}

createServer({
    log,
    middlewareHook: app => {
        if (process.env.ENABLE_SSR) {
            const ssrMiddleware = createSsrMiddleware<AppState>({
                app,
                ssrTimeoutMs: 1000,
                renderApp,
                renderHtml,
                errorLocation: '/error',
                setupRequest: () => ({}),
            })

            app.get('*', ssrMiddleware)
        }
    },
})
