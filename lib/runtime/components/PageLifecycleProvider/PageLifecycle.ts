import * as H from 'history'
import { PageProps } from './PageLifecycleProvider'
import {
    PageLifecycleProps,
    StateChangeCallback,
    RouteChangeCallback,
    LoadingStates,
    LifecycleState,
} from './withPageLifecycle'
import { Logger } from '../../util/log'

export class PageLifecycle implements PageLifecycleProps, PageProps {
    static displayName = 'PageLifecycle'

    /** Adds data to the page */
    updatePageProps: (props: object) => void
    pageRenderComplete: () => void
    /** Increment loading count */
    beginLoadingData: () => void
    /** Decrement loading count */
    endLoadingData: () => void
    stateChangedListeners: StateChangeCallback[] = []
    routeChangedListeners: RouteChangeCallback[] = []

    constructor(
        updatePageProps: (props: object) => void,
        onPageRender: () => void,
        beginLoadingData: () => void,
        endLoadingData: () => void,
        public currentPageState: LoadingStates,
        public currentPageLocation: H.Location,
        public logger: Logger | undefined,
    ) {
        this.updatePageProps = updatePageProps
        this.pageRenderComplete = onPageRender
        this.beginLoadingData = beginLoadingData
        this.endLoadingData = endLoadingData
    }

    pageStateChanged = (state: LifecycleState) => {
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
