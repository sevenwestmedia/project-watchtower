import { Store } from 'redux'
import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../../lib/runtime/universal'
import { renderApp } from './render-app'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { AppState } from '../common/App.redux'
import createStore from '../common/createStore'

const log = createConsoleLogger()

export interface SSRState {
    store: Store<AppState>
}

createServer({
    log,
    middlewareHook: app => {
        // To enable SSR simply register the SSR middleware as the default
        // express handler.
        const ssrMiddleware = createSsrMiddleware<SSRState>({
            app,
            ssrTimeoutMs: 1000,
            // You can access the current requests additional state through
            // the context key on the renderApp options object
            renderApp: ({ context }) => renderApp(context.ssrRequestProps),
            renderHtml,
            errorLocation: '/error',
            setupRequest: async (_, promiseTracker) => ({
                store: createStore(undefined, [promiseTracker.middleware()]),
            }),
        })

        app.get('*', ssrMiddleware)
    },
})
