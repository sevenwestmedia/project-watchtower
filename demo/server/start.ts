import { createServer } from '../../lib/runtime/server'
import { createSsrMiddleware } from '../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../lib/runtime/universal'
import { createStore } from 'redux'
import { applyMiddleware } from 'redux'
import { compose } from 'redux'
import { combineReducers } from 'redux'
import { renderApp } from './render-app'
import { renderHtml } from './render-html'

const log = createConsoleLogger()

// tslint:disable-next-line:no-empty-interface
interface AppState {}

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
                createReduxStore: async (middlewares, _req) => {
                    const store = createStore(
                        combineReducers({}),
                        {},
                        compose(applyMiddleware(...middlewares), (f: any) => f),
                    )

                    return store
                },
            })

            app.get('*', ssrMiddleware)
        }
    },
})
