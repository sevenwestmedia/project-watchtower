import { Store } from 'redux'
import { consoleLogger } from 'typescript-log'
import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { AppState } from '../common/App.redux'
import createStore from '../common/createStore'
import { renderApp } from './render-app'

const log = consoleLogger()

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
            errorLocation: '/error',
            pageNotFoundLocation: '/page-not-found',
            // You can access the current requests additional state through
            // the context key on the renderApp options object
            renderApp: ({ context }) => renderApp(context.ssrRequestProps),
            renderHtml,
            setupRequest: async (_, promiseTracker) => ({
                store: createStore(undefined, [promiseTracker.middleware()]),
            }),
            ssrTimeoutMs: 1000,
        })

        app.get('*', ssrMiddleware)
    },
})
