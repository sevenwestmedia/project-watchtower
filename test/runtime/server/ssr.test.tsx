import * as path from 'path'
import * as React from 'react'
import * as supertest from 'supertest'
import { createServer } from '../../../lib/runtime/server/server'
import { createSsrMiddleware, RenderApp } from '../../../lib/runtime/server/ssr'
import { createConsoleLogger } from '../../../lib/runtime/universal'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'

const log = createConsoleLogger()

it(
    'can render ssr',
    ssrFixture(
        () => <div>EXAMPLE SSR</div>,
        fixture => {
            return fixture.server
                .get('/')
                .expect(200)
                .then(res => {
                    expect(res.text).toContain('EXAMPLE SSR')
                })
        },
    ),
)

// tslint:disable-next-line:no-empty-interface
export interface SSRState {}

function ssrFixture(
    renderApp: RenderApp<SSRState>,
    test: (fixture: { server: supertest.SuperTest<supertest.Test> }) => Promise<any>,
) {
    // Return the test for Jest to run
    return async () => {
        process.env.PROJECT_DIR = path.join(__dirname, 'ssr-test-project')
        const server = createServer({
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
                    setupRequest: async () => ({}),
                })

                app.get('*', ssrMiddleware)
            },
            startListening: false,
        })

        return test({ server: supertest(server) })
    }
}
