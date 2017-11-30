import * as React from 'react'
import * as PropTypes from 'prop-types'
import { withRouter, RouteComponentProps } from 'react-router'
import * as H from 'history'
import { PageLifecycle } from './PageLifecycle'
import { Logger } from '../../universal'

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

export interface OwnProps {
    render: React.ReactElement<any> | ((pageProps: PageProps) => React.ReactElement<any>)
    onEvent: (event: PageEvent) => void
    logger?: Logger
}

type Props = OwnProps & RouteComponentProps<{}>

export type LoadingStates = 'loading' | 'loaded'

export type LifecycleState = {
    currentPageState: LoadingStates
    currentPageLocation: H.Location
}
export type PageLifecycleProps = LifecycleState & PageProps

export type StateChangeCallback = (state: LifecycleState) => void
export type RouteChangeCallback = (location: H.Location) => void

// tslint:disable-next-line:max-classes-per-file
export class ComponentWithLifecycle<P, S> extends React.Component<P & PageLifecycleProps, S> {
    context: {
        pageLifecycle: PageLifecycle
    }
}

type LifecycleComponent<T> =
    | React.ComponentClass<PageLifecycleProps & T>
    | React.SFC<PageLifecycleProps & T>

// tslint:disable-next-line:only-arrow-functions
export const withPageLifecycleProps = function<T>(
    Component: LifecycleComponent<T>,
): React.ComponentClass<T> {
    // tslint:disable-next-line:max-classes-per-file
    return class WithPageLifecycleProps extends React.Component<T, LifecycleState> {
        static contextTypes = {
            pageLifecycle: PropTypes.object,
            logger: PropTypes.object,
        }

        context: {
            pageLifecycle: PageLifecycle
            logger: Logger | undefined
        }

        state: LifecycleState

        constructor(props: T, context: { pageLifecycle: PageLifecycle }) {
            super(props, context)

            if (!context) {
                return
            }
            this.state = {
                currentPageState: context.pageLifecycle.currentPageState,
                currentPageLocation: context.pageLifecycle.currentPageLocation,
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

        pageStateChanged = (pageState: LifecycleState) => {
            if (this.context.logger) {
                this.context.logger.trace(
                    {
                        currentPageState: pageState.currentPageState,
                        currentPageLocation: pageState.currentPageLocation,
                    },
                    'Setting pageState on WithPageLifecycle',
                )
            }
            this.setState(pageState)
        }

        render() {
            return (
                <Component
                    {...this.props}
                    currentPageState={this.state.currentPageState}
                    currentPageLocation={this.state.currentPageLocation}
                    beginLoadingData={this.context.pageLifecycle.beginLoadingData}
                    endLoadingData={this.context.pageLifecycle.endLoadingData}
                />
            )
        }
    }
}

export const withPageLifecycleEvents = (Component: React.ComponentClass<any>) => {
    Component.contextTypes = {
        ...Component.contextTypes,
        pageLifecycle: PropTypes.object,
    }

    return Component
}

// tslint:disable-next-line:max-classes-per-file
class PageLifecycleProvider extends React.Component<Props, {}> {
    static childContextTypes = {
        pageLifecycle: PropTypes.object,
        logger: PropTypes.object,
    }

    raiseStartOnRender: boolean
    isRouting: boolean
    loadingDataCount: number
    pageLifecycle: PageLifecycle

    currentPageProps: object = {}

    constructor(props: Props) {
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
            logger: this.props.logger,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
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

const PageLifecycleProviderWithRouter = withRouter<OwnProps>(PageLifecycleProvider)

export { PageLifecycleProviderWithRouter as PageLifecycleProvider }
