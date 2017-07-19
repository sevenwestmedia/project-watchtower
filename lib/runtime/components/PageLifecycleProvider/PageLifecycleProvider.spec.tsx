/**
 * @jest-environment jsdom
 */

import * as React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import { mount } from 'enzyme'
import * as H from 'history'

import {
    PageLifecycleProvider, withPageLifecycleEvents, ComponentWithLifecycle, PageEvent,
} from './PageLifecycleProvider'
import PromiseCompletionSource from '../../util/promise-completion-source'
import { DataLoaderResources } from 'redux-data-loader'
import { Page } from '../Page/Page'

interface TestData {
    bar: string
}

const loaderStatusLookup: { [state: number]: string } = {
    0: 'Idle',
    1: 'Fetching',
    2: 'Refreshing',
    3: 'Paging',
    4: 'Updating',
}

const createTestComponents = () => {
    const resources = new DataLoaderResources()
    const promiseCompletionSource = new PromiseCompletionSource<TestData>()
    const TestDataLoader = resources.registerResource(
        'test',
        (_id: string) => {
            return promiseCompletionSource.promise
        },
    )
    class TestPage extends React.Component<{ path: string }, {}> {
        render() {
            return (
                <Page errorComponent="oops">
                    <TestDataLoader
                        resourceId={'test' + this.props.path}
                        renderData={(data) => (
                            <div>
                                Status: {loaderStatusLookup[data.status]}
                                Last action: {JSON.stringify(data.lastAction || {})}
                            </div>
                        )}
                    />
                </Page>
            )
        }
    }

    const FakeLazyLoad = withPageLifecycleEvents(
        // tslint:disable-next-line:max-classes-per-file
        class extends ComponentWithLifecycle<{ path: string}, { loaded: boolean }> {
            state = { loaded: false }

            componentDidMount() {
                this.context.pageLifecycle.lazyLoadingPage()
                // When we mount, pretend we are starting to load the test page
                setTimeout(() => {
                    this.context.pageLifecycle.lazyLoadingPageComplete()
                    this.setState({ loaded: true })
                })
            }

            render() {
                return (
                    this.state.loaded
                        ? <TestPage {...this.props} />
                        : <noscript />
                )
            }
        },
    )
    return {
        resources,
        promiseCompletionSource,
        TestDataLoader,
        FakeLazyLoad,
        TestPage,
    }
}

describe('PageLifecycleProvider', () => {
    it('raises loading event after render', () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount((
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <PageLifecycleProvider
                        resources={testComponents.resources}
                        onEvent={(event) => pageEvents.push(event)}
                    >
                        <testComponents.TestPage path="/" />
                    </PageLifecycleProvider>
                </MemoryRouter>
            </Provider>
        ))

        const testPage = wrapper.find(testComponents.TestPage)

        expect(pageEvents.map((e) => {
            e.timeStamp = 0
            return e
        })).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    it('raises completed event after data loaded and content re-rendered', async () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount((
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <PageLifecycleProvider
                        resources={testComponents.resources}
                        onEvent={(event) => pageEvents.push(event)}
                    >
                        <testComponents.TestPage path="/" />
                    </PageLifecycleProvider>
                </MemoryRouter>
            </Provider>
        ))

        const testPage = wrapper.find(testComponents.TestPage)
        testComponents.promiseCompletionSource.resolve({
            bar: 'test',
        })
        expect(pageEvents.length).toBe(1)
        await new Promise((resolve) => setTimeout(() => resolve()))

        expect(pageEvents.map((e) => {
            e.timeStamp = 0
            return e
        })).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    it('raises completed event after lazy loaded page has completed load data', async () => {
        const testComponents = createTestComponents()
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount((
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']} initialIndex={0}>
                    <PageLifecycleProvider
                        resources={testComponents.resources}
                        onEvent={(event) => pageEvents.push(event)}
                    >
                        <Page errorComponent="oops">
                            <testComponents.FakeLazyLoad path="/" />
                        </Page>
                    </PageLifecycleProvider>
                </MemoryRouter>
            </Provider>
        ))

        const testPage = wrapper.find(testComponents.TestPage)

        expect(pageEvents.map((e) => {
            e.timeStamp = 0
            return e
        })).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
        await new Promise((resolve) => setTimeout(() => resolve()))

        testComponents.promiseCompletionSource.resolve({
            bar: 'test',
        })
        // We should not have received the completed event yet
        expect(pageEvents.length).toBe(1)

        // Let the completion propagate
        await new Promise((resolve) => setTimeout(() => resolve()))
        expect(pageEvents.map((e) => {
            e.timeStamp = 0
            return e
        })).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })

    // TODO Test which validates page load events on navigation..

    it('raises events when page navigated', async () => {
        const testComponents = createTestComponents()
        let history: H.History | undefined
        const pageEvents: PageEvent[] = []

        const store = createStore((s = {}, _) => s)
        const wrapper = mount((
            <Provider store={store}>
                <MemoryRouter initialEntries={['/', '/foo']} initialIndex={0}>
                    <PageLifecycleProvider
                        resources={testComponents.resources}
                        onEvent={(event) => pageEvents.push(event)}
                    >
                        <Route
                            render={(props) => {
                                history = props.history
                                return (
                                    <testComponents.TestPage path={props.location.pathname} />
                                )}
                            }
                        />
                    </PageLifecycleProvider>
                </MemoryRouter>
            </Provider>
        ))

        testComponents.promiseCompletionSource.resolve({ bar: 'test' })
        await new Promise((resolve) => setTimeout(() => resolve()))

        if (history) { history.push('/foo') }

        const testPage = wrapper.find(testComponents.TestPage)

        testComponents.promiseCompletionSource.resolve({ bar: 'page2' })
        await new Promise((resolve) => setTimeout(() => resolve()))
        expect(pageEvents.map((e) => {
            e.timeStamp = 0
            return e
        })).toMatchSnapshot()
        expect(testPage.debug()).toMatchSnapshot()
    })
})
