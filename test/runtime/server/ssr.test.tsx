import * as path from 'path'
import * as React from 'react'
import * as supertest from 'supertest'
import { createServer } from '../../../lib/runtime/server/server'
import { createSsrMiddleware, RenderApp } from '../../../lib/runtime/server/ssr'
import {
    createConsoleLogger,
    PromiseCompletionSource,
    PromiseTracker,
} from '../../../lib/runtime/universal'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { Route } from 'react-router-dom'
import { Status404Error } from '../../../lib/runtime/server/ssr/errors'

const log = createConsoleLogger()
Error.stackTraceLimit = Infinity

it(
    'can render ssr',
    ssrFixture(fixture => {
        fixture.renderFn = () => <div>EXAMPLE SSR</div>

        return fixture.server
            .get('/')
            .expect(200)
            .then(res => {
                expect(res.text).toContain('EXAMPLE SSR')
            })
    }),
)

it(
    're-renders when data has been loaded',
    ssrFixture(fixture => {
        const dataLoadSource = new PromiseCompletionSource()

        // This component uses the dataLoadSource to decide if it needs to load
        // data. If it does, it uses the promise tracker to track the data load
        // progress.
        // Once dataLoadSource.resolve() is called, watchtower will re-render
        // and this component will render 'Data Loaded'
        class ComponentWhichLoadsData extends React.Component<{ promiseTracker: PromiseTracker }> {
            componentWillMount() {
                // If we don't have data, simulate loading some data
                if (!dataLoadSource.completed) {
                    this.props.promiseTracker.track(dataLoadSource.promise)
                    setTimeout(() => dataLoadSource.resolve(''), 100)
                }
            }

            render() {
                return <div>{dataLoadSource.completed ? 'Data loaded' : 'Data loading'}</div>
            }
        }

        fixture.renderFn = ({ context }) => {
            return <ComponentWhichLoadsData promiseTracker={context.promiseTracker} />
        }

        return fixture.server
            .get('/')
            .expect(200)
            .then(res => {
                expect(res.text).toContain('Data loaded')
            })
    }),
)

it(
    'renders error page when data load rejects',
    ssrFixture(
        fixture => {
            const dataLoadSource = new PromiseCompletionSource()

            // tslint:disable-next-line:max-classes-per-file
            class ComponentWhichLoadDataFails extends React.Component<{
                promiseTracker: PromiseTracker
            }> {
                componentWillMount() {
                    // If we don't have data, simulate loading some data
                    if (!dataLoadSource.completed) {
                        this.props.promiseTracker.track(dataLoadSource.promise)
                        setTimeout(() => dataLoadSource.reject(new Error('Oops')), 100)
                    }
                }

                render() {
                    return <div>Data loading</div>
                }
            }

            fixture.renderFn = ({ context }) => {
                return (
                    <div>
                        <Route
                            path="/"
                            exact
                            render={() => (
                                <ComponentWhichLoadDataFails
                                    promiseTracker={context.promiseTracker}
                                />
                            )}
                        />
                        <Route path="/error" render={() => <div>Custom error page</div>} />
                    </div>
                )
            }

            return fixture.server
                .get('/')
                .expect(500)
                .then(res => {
                    expect(res.text).toContain('Custom error page')
                })
        },
        {
            errorLocation: '/error',
        },
    ),
)

it(
    'renders 404 page when data load rejects with Status404Error',
    ssrFixture(
        fixture => {
            const dataLoadSource = new PromiseCompletionSource()

            // tslint:disable-next-line:max-classes-per-file
            class ComponentWhichLoadDataFails extends React.Component<{
                promiseTracker: PromiseTracker
            }> {
                componentWillMount() {
                    // If we don't have data, simulate loading some data
                    if (!dataLoadSource.completed) {
                        this.props.promiseTracker.track(dataLoadSource.promise)
                        setTimeout(() => dataLoadSource.reject(new Status404Error()), 100)
                    }
                }

                render() {
                    return <div>Data loading</div>
                }
            }

            fixture.renderFn = ({ context }) => {
                return (
                    <div>
                        <Route
                            path="/"
                            exact
                            render={() => (
                                <ComponentWhichLoadDataFails
                                    promiseTracker={context.promiseTracker}
                                />
                            )}
                        />
                        <Route
                            path="/page-not-found"
                            render={() => <div>Custom page not found</div>}
                        />
                    </div>
                )
            }

            return fixture.server
                .get('/')
                .expect(404)
                .then(res => {
                    expect(res.text).toContain('Custom page not found')
                })
        },
        {
            errorLocation: '/error',
        },
    ),
)

it(
    'renders error page when render of page fails',
    ssrFixture(
        fixture => {
            const BrokenComponent = () => {
                throw new Error('oops, render failed')
            }

            fixture.renderFn = ({}) => {
                return (
                    <div>
                        <Route path="/" exact render={() => <BrokenComponent />} />
                        <Route path="/error" render={() => <div>Custom error page</div>} />
                    </div>
                )
            }

            return fixture.server
                .get('/')
                .expect(500)
                .then(res => {
                    expect(res.text).toContain('Custom error page')
                })
        },
        {
            errorLocation: '/error',
        },
    ),
)

it(
    'returns 500 with no body content when error page fails to render',
    ssrFixture(
        fixture => {
            const BrokenComponent = () => {
                throw new Error('oops, render failed')
            }

            fixture.renderFn = ({}) => {
                return (
                    <div>
                        <Route path="/" exact render={() => <BrokenComponent />} />
                        <Route path="/error" render={() => <BrokenComponent />} />
                    </div>
                )
            }

            return fixture.server
                .get('/')
                .expect(500)
                .then(res => {
                    expect(res.text).toBe('')
                })
        },
        {
            errorLocation: '/error',
        },
    ),
)

it(
    'renders error page when tracked promise is rejected already',
    ssrFixture(
        fixture => {
            const dataLoadSource = new PromiseCompletionSource()

            // tslint:disable-next-line:max-classes-per-file
            class ComponentWhichLoadDataFails extends React.Component<{
                promiseTracker: PromiseTracker
            }> {
                componentWillMount() {
                    // If we don't have data, simulate loading some data
                    if (!dataLoadSource.completed) {
                        this.props.promiseTracker.track(dataLoadSource.promise)
                        dataLoadSource.reject(new Error('Oops'))
                    }
                }

                render() {
                    return <div>Data loading</div>
                }
            }

            fixture.renderFn = ({ context }) => {
                return (
                    <div>
                        <Route
                            path="/"
                            exact
                            render={() => (
                                <ComponentWhichLoadDataFails
                                    promiseTracker={context.promiseTracker}
                                />
                            )}
                        />
                        <Route path="/error" render={() => <div>Custom error page</div>} />
                    </div>
                )
            }

            return fixture.server
                .get('/')
                .expect(500)
                .then(res => {
                    expect(res.text).toContain('Custom error page')
                })
        },
        {
            errorLocation: '/error',
        },
    ),
)

// tslint:disable-next-line:no-empty-interface
export interface SSRState {}
export interface Fixture {
    renderFn: RenderApp<SSRState>
    server: supertest.SuperTest<supertest.Test>
}

function ssrFixture(
    test: (fixture: Fixture) => Promise<any>,
    options: { errorLocation?: string; pageNotFoundLocation?: string } = {},
) {
    // Return the test for Jest to run
    return async () => {
        process.env.PROJECT_DIR = path.join(__dirname, 'ssr-test-project')

        const fixture: Fixture = {
            renderFn: () => <div />,
            server: supertest(
                createServer({
                    log,
                    middlewareHook: app => {
                        // To enable SSR simply register the SSR middleware as the default
                        // express handler.
                        const ssrMiddleware = createSsrMiddleware<SSRState>({
                            app,
                            ssrTimeoutMs: 1000,
                            renderApp: params => fixture.renderFn(params),
                            renderHtml,
                            errorLocation: options.errorLocation || '/error',
                            pageNotFoundLocation: options.pageNotFoundLocation || '/page-not-found',
                            setupRequest: async () => ({}),
                        })

                        app.get('*', ssrMiddleware)
                    },
                    startListening: false,
                }),
            ),
        }

        return test(fixture)
    }
}
