import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router'
import * as H from 'history'

import { DataProvider, DataLoaderResources } from 'redux-data-loader'
// TODO Should re-export this in redux-data-loader
import { DataLoaderState } from 'redux-data-loader/src/data-loader-actions'

// TODO These types are duplicated in the component library
export interface ComponentEvent<T> {
    type: string
    timeStamp: number
    originator: string
    payload: T
}
export declare type Properties = {
    [key: string]: any;
}
export interface PageLoadStarted extends ComponentEvent<Properties> {
    type: 'page-load-started'
}

export interface PageLoadFailed extends ComponentEvent<Properties & { error: string }> {
    type: 'page-load-failed'
}

export interface PageLoadComplete extends ComponentEvent<Properties> {
    type: 'page-load-complete'
}

export type PageEvent = PageLoadStarted | PageLoadFailed | PageLoadComplete

export interface OwnProps {
    resources: DataLoaderResources
    onEvent: (event: PageEvent) => void
}

type Props = OwnProps & RouteComponentProps<{}>

export type LoadingStates = 'loading' | 'loaded'

export interface PageLifecycleProps {
    currentPageState: LoadingStates
    currentPageLocation: string
}

type LifecycleState = PageLifecycleProps

export type StateChangeCallback = (state: PageLifecycleProps) => void
export type RouteChangeCallback = (location: H.Location) => void

export class PageLifecycle implements PageLifecycleProps {
    pageRenderComplete: () => void
    lazyLoadingPage: () => void
    lazyLoadingPageComplete: () => void
    stateChangedListeners: StateChangeCallback[] = []
    routeChangedListeners: RouteChangeCallback[] = []

    constructor(
        onPageRender: () => void,
        onPageLazyLoading: () => void,
        onPageLazyLoadingComplete: () => void,
        public currentPageState: LoadingStates,
        public currentPageLocation: string,
    ) {
        this.pageRenderComplete = onPageRender
        this.lazyLoadingPage = onPageLazyLoading
        this.lazyLoadingPageComplete = onPageLazyLoadingComplete
    }

    pageStateChanged = (state: PageLifecycleProps) => {
        for (const listener of this.stateChangedListeners) {
            listener(state)
        }
    }

    routeChanged = (newLocation: H.Location) => {
        for (const listener of this.routeChangedListeners) {
            listener(newLocation)
        }
    }

    onPageStateChanged = (stateChangeCallback: StateChangeCallback) => {
        this.stateChangedListeners.push(stateChangeCallback)
    }

    offPageStateChanged = (stateChangeCallback: StateChangeCallback) => {
        const listenerIndex = this.stateChangedListeners.indexOf(stateChangeCallback)
        if (listenerIndex !== -1) {
            this.stateChangedListeners.splice(listenerIndex, 1)
        }
    }

    onRouteChanged = (routeChangeCallback: RouteChangeCallback) => {
        this.routeChangedListeners.push(routeChangeCallback)
    }

    offRouteChanged = (routeChangeCallback: RouteChangeCallback) => {
        const listenerIndex = this.routeChangedListeners.indexOf(routeChangeCallback)
        if (listenerIndex !== -1) {
            this.routeChangedListeners.splice(listenerIndex, 1)
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
export class ComponentWithLifecycle<P, S> extends React.Component<P & PageLifecycleProps, S> {
    context: {
        pageLifecycle: PageLifecycle,
    }
}

type LifecycleComponent<T> =
 | React.ComponentClass<PageLifecycleProps & T>
 | React.SFC<PageLifecycleProps & T>

// tslint:disable-next-line:max-line-length
// tslint:disable-next-line:only-arrow-functions
export const withPageLifecycleProps = function<T>(Component: LifecycleComponent<T>): React.ComponentClass<T> {
    // tslint:disable-next-line:max-classes-per-file
    return class WithPageLifecycleProps extends React.Component<T, LifecycleState> {
        static contextTypes = {
            pageLifecycle: React.PropTypes.object,
        }

        context: {
            pageLifecycle: PageLifecycle,
        }

        state: LifecycleState

        constructor(props: T, context: { pageLifecycle: PageLifecycle }) {
            super(props, context)

            this.state = {
                currentPageState: context.pageLifecycle
                    ? context.pageLifecycle.currentPageState
                    : 'loading',
                currentPageLocation: context.pageLifecycle
                    ? context.pageLifecycle.currentPageLocation
                    : '',
            }
        }

        componentWillMount() {
            if (!this.context.pageLifecycle) {
                return
            }
            this.context.pageLifecycle.onPageStateChanged(this.pageStateChanged)
        }

        componentWillUnmount() {
            this.context.pageLifecycle.offPageStateChanged(this.pageStateChanged)
        }

        pageStateChanged = (pageState: PageLifecycleProps) => {
            this.setState(pageState)
        }

        render() {
            return (
                <Component
                    {...this.props}
                    currentPageState={this.state.currentPageState}
                    currentPageLocation={this.state.currentPageLocation}
                />
            )
        }
    }
}

export const withPageLifecycleEvents = (Component: React.ComponentClass<any>) => {
    Component.contextTypes = {
        ...Component.contextTypes,
        pageLifecycle: React.PropTypes.object,
    }

    return Component
}

// tslint:disable-next-line:max-classes-per-file
class PageLifecycleProvider extends React.Component<Props, {}> {
    static childContextTypes = {
        pageLifecycle: React.PropTypes.object,
    }

    isRouting: boolean
    isLoadingData: boolean
    isLazyLoadingPage: boolean
    pageLifecycle: PageLifecycle

    constructor(props: Props) {
        super(props)

        this.isRouting = true
        this.isLoadingData = false
        this.isLazyLoadingPage = false
        this.pageLifecycle = new PageLifecycle(
            this.onPageRender,
            this.onPageLazyLoading,
            this.onPageLazyLoadingComplete,
            'loading',
            this.props.location.pathname,
        )
    }

    componentWillMount() {
        this.raisePageLoadStartEvent()
    }

    stateChanged = () => {
        const isLoading = this.isRouting || this.isLoadingData || this.isLazyLoadingPage
        const currentPageState = isLoading
                ? 'loading'
                : 'loaded'
        this.pageLifecycle.pageStateChanged({
            currentPageState,
            currentPageLocation: this.props.location.pathname,
        })
    }

    raisePageLoadStartEvent = () => {
        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-started',
            originator: 'PageEvents',
            // TODO Add payload
            payload: {},
            timeStamp: new Date().getTime(),
        })
    }

    raisePageLoadCompleteEvent = () => {
        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-complete',
            originator: 'PageEvents',
            // TODO Add payload
            payload: {},
            timeStamp: new Date().getTime(),
        })
    }

    onPageRender = () => {
        // We started routing, but no loading data events have fired
        if (this.isRouting && !this.isLoadingData && !this.isLazyLoadingPage) {
            this.isRouting = false
            this.raisePageLoadCompleteEvent()
        }
    }

    onPageLazyLoading = () => {
        this.isLazyLoadingPage = true
    }

    onPageLazyLoadingComplete = () => {
        this.isLazyLoadingPage = false
    }

    getChildContext() {
        return {
            pageLifecycle: this.pageLifecycle,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.location !== nextProps.location) {
            this.isRouting = true
            this.raisePageLoadStartEvent()
            this.pageLifecycle.routeChanged(nextProps.location)
        }
    }

    loadingCountChanged = () => {
        this.isLoadingData = true
    }

    dataLoaderLoadAllComplete = () => {
        this.isRouting = false
        this.isLoadingData = false
        this.raisePageLoadCompleteEvent()
    }

    render() {
        return (
            <DataProvider
                isServerSideRender={false}
                resources={this.props.resources}
                loadingCountUpdated={this.loadingCountChanged}
                loadAllCompleted={this.dataLoaderLoadAllComplete}
            >
                {this.props.children}
            </DataProvider>
        )
    }
}

export default withRouter(PageLifecycleProvider) as React.ComponentClass<OwnProps>
