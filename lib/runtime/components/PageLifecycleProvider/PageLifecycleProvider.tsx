import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as H from 'history'
import { withRouter, RouteComponentProps } from 'react-router'
import { PageLifecycle } from './PageLifecycle'
import { Logger } from '../../universal'
import { LoadingStates } from './withPageLifecycle'

export interface PageLifecycleEvent<T> {
    type: string
    timeStamp: number
    originator: string
    payload: T
}
export declare type Properties = {
    location: H.Location
    [key: string]: any
}
export interface PageLoadStarted extends PageLifecycleEvent<Properties> {
    type: 'page-load-started'
}

export interface PageLoadFailed extends PageLifecycleEvent<Properties & { error: string }> {
    type: 'page-load-failed'
}

export interface PageLoadComplete extends PageLifecycleEvent<Properties> {
    type: 'page-load-complete'
}

export type PageEvent = PageLoadStarted | PageLoadFailed | PageLoadComplete

export interface PageProps {
    /** Increments loading count */
    beginLoadingData: () => void
    /** Decrements loading count */
    endLoadingData: () => void
    currentPageLocation: H.Location
}

export interface PageLifecycleProviderProps extends RouteComponentProps<{}> {
    render: React.ReactElement<any> | ((pageProps: PageProps) => React.ReactElement<any>)
    onEvent: (event: PageEvent) => void
    logger?: Logger
}

class PageLifecycleProvider extends React.Component<PageLifecycleProviderProps, {}> {
    static displayName = 'PageLifecycleProvider'

    static childContextTypes = {
        pageLifecycle: PropTypes.object,
    }

    raiseStartOnRender: boolean
    isRouting: boolean
    loadingDataCount: number
    pageLifecycle: PageLifecycle

    currentPageProps: object = {}

    constructor(props: PageLifecycleProviderProps) {
        super(props)

        this.isRouting = true
        this.loadingDataCount = 0
        this.pageLifecycle = new PageLifecycle(
            this.updatePageProps,
            this.onPageRender,
            this.beginLoadingData,
            this.endLoadingData,
            'loading',
            this.props.location,
        )
    }

    componentWillMount() {
        this.raisePageLoadStartEvent()
    }

    stateChanged = () => {
        const isLoading = this.isRouting || this.loadingDataCount > 0
        const currentPageState: LoadingStates = isLoading ? 'loading' : 'loaded'
        const newState = {
            currentPageState,
            currentPageLocation: this.props.location,
        }
        if (this.props.logger) {
            this.props.logger.trace(newState, 'State changed')
        }
        this.pageLifecycle.pageStateChanged(newState)
    }

    raisePageLoadStartEvent = () => {
        if (this.props.logger) {
            this.props.logger.trace({}, 'Rasing start load event')
        }

        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-started',
            originator: 'PageEvents',
            payload: {
                ...this.currentPageProps,
                location: this.props.location,
            },
            timeStamp: new Date().getTime(),
        })
    }

    raisePageLoadCompleteEvent = () => {
        if (this.props.logger) {
            this.props.logger.trace(
                { currentPageProps: this.currentPageProps },
                'Raising page load complete event',
            )
        }

        this.isRouting = false
        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-complete',
            originator: 'PageEvents',
            payload: {
                ...this.currentPageProps,
                location: this.props.location,
            },
            timeStamp: new Date().getTime(),
        })
    }

    updatePageProps = (props: object) => {
        const existingProps = this.currentPageProps
        // Ensure we don't clear props which are already specified
        // This behavior is still not deterministic, possible solution is to
        // maintain the order we got the props. Or Page always is least important,
        // then additional is next.
        // This issue only exists if the same prop name is specified in multiple areas
        Object.keys(props).forEach(
            key => (props as any)[key] === undefined && delete (props as any)[key],
        )

        this.currentPageProps = { ...this.currentPageProps, ...props }

        if (this.props.logger) {
            this.props.logger.trace(
                { currentPageProps: this.currentPageProps, existingProps, props },
                'Updating page props',
            )
        }
    }

    onPageRender = () => {
        if (this.raiseStartOnRender) {
            // We need to raise start after the page has been rendered
            // so we get the correct page props
            this.raisePageLoadStartEvent()
            this.raiseStartOnRender = false
        }
        // We started routing, but no loading data events have fired
        if (this.isRouting && this.loadingDataCount === 0) {
            this.isRouting = false
            this.raisePageLoadCompleteEvent()
        }
    }

    getChildContext() {
        return {
            pageLifecycle: this.pageLifecycle,
        }
    }

    componentWillReceiveProps(nextProps: PageLifecycleProviderProps) {
        // We only care about pathname, not any of the other location info
        if (this.props.location.pathname !== nextProps.location.pathname) {
            if (this.props.logger) {
                this.props.logger.trace(
                    { oldPath: this.props.location.pathname, newPath: nextProps.location.pathname },
                    'Path changed',
                )
            }

            this.isRouting = true
            this.raiseStartOnRender = true
            // We should clear the current page props at this point because the re-render
            // has not happened and we should start collecting again
            this.currentPageProps = {}
            this.pageLifecycle.routeChanged(nextProps.location)
        }
    }

    beginLoadingData = () => {
        this.loadingDataCount++
        if (this.props.logger) {
            this.props.logger.trace(
                { loadingDataCount: this.loadingDataCount },
                'Begin loading data',
            )
        }
    }

    endLoadingData = () => {
        this.loadingDataCount--
        if (this.props.logger) {
            this.props.logger.trace({ loadingDataCount: this.loadingDataCount }, 'End loading data')
        }

        if (this.loadingDataCount === 0) {
            this.raisePageLoadCompleteEvent()
        }
    }

    render() {
        if (typeof this.props.render === 'function') {
            return this.props.render({
                beginLoadingData: this.beginLoadingData,
                endLoadingData: this.endLoadingData,
                currentPageLocation: this.props.location,
            })
        }
        return this.props.render
    }
}

const PageLifecycleProviderWithRouter = withRouter<PageLifecycleProviderProps>(
    PageLifecycleProvider,
)

export { PageLifecycleProviderWithRouter as PageLifecycleProvider }
