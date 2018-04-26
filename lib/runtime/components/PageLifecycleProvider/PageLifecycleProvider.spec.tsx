/**
 * @jest-environment jsdom
 */

;(global as any).requestAnimationFrame = (callback: any) => {
    setTimeout(callback, 0)
}

import * as React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import { mount, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as H from 'history'

import { PageLifecycleProvider, PageEvent } from './PageLifecycleProvider'
import { PromiseCompletionSource, createConsoleLogger } from '../../universal'
import Page from '../Page/Page'
import { PageAdditionalProps } from '../Page/PageAdditionalProps'
import { withPageLifecycleEvents } from './withPageLifecycle'
import { ComponentWithLifecycle } from './ComponentWithLifeCycle'
import { LogProvider } from '../LogProvider/LogProvider'

configure({ adapter: new Adapter() })
const testLogger = createConsoleLogger()

interface TestData {
    bar: string
}

const createTestComponents = () => {
    const promiseCompletionSource = new PromiseCompletionSource<TestData>()
    class TestPage extends React.Component<{ path: string; extraProps?: object }, {}> {
        loadTriggered = false

        render() {
            return (
                <Page
                    pageProperties={this.props.extraProps}
                    page={pageProps => {
                        testLogger.trace({ pageProps }, 'Rendering TestPage')
                        // This emulates a component under the page starting to load data
                        // then completing once the promise completion source completes
                        if (!this.loadTriggered) {
                            pageProps.beginLoadingData()
                            this.loadTriggered = true
                            promiseCompletionSource.promise.then(() => pageProps.endLoadingData())
                        }
                        return (
                            <div>
                                Page location: {pageProps.currentPageLocation.pathname}
                                Page state: {pageProps.currentPageState}
                            </div>
                        )
                    }}
                />
            )
        }
    }

    const FakeLazyLoad = withPageLifecycleEvents(
        // tslint:disable-next-line:max-classes-per-file
        class extends ComponentWithLifecycle<{ path: string }, { loaded: boolean }> {
            state = { loaded: false }

            componentDidMount() {
                this.context.pageLifecycle.beginLoadingData()
                // When we mount, pretend we are starting to load the test page
                setTimeout(() => {
                    this.setState(
                        { loaded: true },
                        // Only end load data after state change has been applied
                        // Because this could trigger more loading of data
                        this.context.pageLifecycle.endLoadingData,
                    )
                })
            }

            render() {
                return this.state.loaded ? <TestPage {...this.props} /> : <noscript />
            }
        },
    )
    return {
        promiseCompletionSource,
        FakeLazyLoad,
        TestPage,
    }
}

describe('PageLifecycleProvider', () => {
    it('raises loading event after render', () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <LogProvider logger={testLogger}>
                        <PageLifecycleProvider
                            onEvent={event => pageEvents.push(event)}
                            render={<testComponents.TestPage path="/" />}
                        />
                    </LogProvider>
                </MemoryRouter>
            </Provider>,
        )

        const testPage = wrapper.find(testComponents.TestPage)

        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    it('can pass extra data to pages', async () => {
        const testComponents = createTestComponents()
        let history: H.History | undefined
        const pageEvents: PageEvent[] = []
        const extraPropsLookup: { [path: string]: object } = {
            '/': { home: 'isHome' },
            '/foo': { foo: 'isFoo' },
        }

        const store = createStore((s = {}, _) => s)
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/', '/foo']} initialIndex={0}>
                    <LogProvider logger={testLogger}>
                        <PageLifecycleProvider
                            onEvent={event => pageEvents.push(event)}
                            render={
                                <Route
                                    render={props => {
                                        history = props.history
                                        return (
                                            <div>
                                                {props.location.pathname === '/' && (
                                                    <PageAdditionalProps
                                                        pageProperties={{
                                                            pageExtra: 'Some extra page data',
                                                        }}
                                                    />
                                                )}
                                                <testComponents.TestPage
                                                    path={props.location.pathname}
                                                    extraProps={
                                                        extraPropsLookup[props.location.pathname]
                                                    }
                                                />
                                            </div>
                                        )
                                    }}
                                />
                            }
                        />
                    </LogProvider>
                </MemoryRouter>
            </Provider>,
        )

        if (!history) {
            throw new Error('History not defined')
        }

        testComponents.promiseCompletionSource.resolve({ bar: 'test' })
        await new Promise(resolve => setTimeout(() => resolve()))
        testComponents.promiseCompletionSource.reset()

        history.push('/foo')

        testComponents.promiseCompletionSource.resolve({ bar: 'page2' })
        await new Promise(resolve => setTimeout(() => resolve()))

        const testPage = wrapper.update().find(testComponents.TestPage)
        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    it('raises completed event after data loaded and content re-rendered', async () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <LogProvider logger={testLogger}>
                        <PageLifecycleProvider
                            onEvent={event => pageEvents.push(event)}
                            render={<testComponents.TestPage path="/" />}
                        />
                    </LogProvider>
                </MemoryRouter>
            </Provider>,
        )

        testComponents.promiseCompletionSource.resolve({
            bar: 'test',
        })

        expect(pageEvents.length).toBe(1)
        await new Promise(resolve => setTimeout(() => resolve()))
        const testPage = wrapper.update().find(testComponents.TestPage)

        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()

        expect(testPage.debug()).toMatchSnapshot()
    })

    it('raises completed event after lazy loaded page has completed load data', async () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <LogProvider logger={testLogger}>
                        {' '}
                        <PageLifecycleProvider
                            onEvent={event => pageEvents.push(event)}
                            render={<Page page={<testComponents.FakeLazyLoad path="/" />} />}
                        />
                    </LogProvider>
                </MemoryRouter>
            </Provider>,
        )

        const testPage = wrapper.find(testComponents.TestPage)

        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
        await new Promise(resolve => setTimeout(() => resolve()))

        testComponents.promiseCompletionSource.resolve({
            bar: 'test',
        })
        // We should not have received the completed event yet
        expect(pageEvents.length).toBe(1)

        // Let the completion propagate
        await new Promise(resolve => setTimeout(() => resolve()))
        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    it('raises events when page navigated', async () => {
        const testComponents = createTestComponents()
        let history: H.History | undefined
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/', '/foo']} initialIndex={0}>
                    <LogProvider logger={testLogger}>
                        <PageLifecycleProvider
                            onEvent={event => pageEvents.push(event)}
                            render={
                                <Route
                                    render={props => {
                                        history = props.history
                                        return (
                                            <testComponents.TestPage
                                                path={props.location.pathname}
                                            />
                                        )
                                    }}
                                />
                            }
                        />
                    </LogProvider>
                </MemoryRouter>
            </Provider>,
        )

        if (!history) {
            throw new Error('History not defined')
        }

        testComponents.promiseCompletionSource.resolve({ bar: 'test' })
        await new Promise(resolve => setTimeout(() => resolve()))
        testComponents.promiseCompletionSource.reset()

        history.push('/foo')

        testComponents.promiseCompletionSource.resolve({ bar: 'page2' })
        await new Promise(resolve => setTimeout(() => resolve()))
        const testPage = wrapper.update().find(testComponents.TestPage)
        expect(
            pageEvents.map(e => {
                e.timeStamp = 0
                if (e.payload && e.payload.location) {
                    e.payload.location.key = '...'
                }
                return e
            }),
        ).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })
})
