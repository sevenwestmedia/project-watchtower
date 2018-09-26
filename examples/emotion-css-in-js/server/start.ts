import { createServer } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../../lib/runtime/universal'
import { renderApp } from './render-app'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { renderStylesToString } from 'emotion-server'
import { renderToString } from 'react-dom/server'

const log = createConsoleLogger()

// tslint:disable-next-line:no-empty-interface
export interface SSRState {}

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
            renderApp,
            renderHtml,
            errorLocation: '/error',
            pageNotFoundLocation: '/page-not-found',
            setupRequest: async () => ({}),
            renderFn: (element: React.ReactElement<any>) =>
                renderStylesToString(renderToString(element)),
        })

        app.get('*', ssrMiddleware)
    },
})
