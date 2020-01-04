import { renderStylesToString } from 'emotion-server'
import { renderToString } from 'react-dom/server'
import { consoleLogger } from 'typescript-log'

import { renderApp } from './render-app'

import { createServer, createSsrMiddleware, renderHtml } from '@project-watchtower/server'

const log = consoleLogger()

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SSRState {}

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
            renderApp,
            renderFn: (element: React.ReactElement<any>) =>
                renderStylesToString(renderToString(element)),
            renderHtml,
            setupRequest: async () => ({}),
            ssrTimeoutMs: 1000,
        })

        app.get('*', ssrMiddleware)
    },
})
