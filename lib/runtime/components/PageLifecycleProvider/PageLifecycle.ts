import * as H from 'history'
import {
    PageLifecycleProps, StateChangeCallback,
    RouteChangeCallback, LoadingStates,
    PageProps, LifecycleState,
} from './PageLifecycleProvider'

export class PageLifecycle implements PageLifecycleProps, PageProps {
    pageRenderComplete: () => void
    /** Increment loading count */
    beginLoadingData: () => void
    /** Decrement loading count */
    endLoadingData: () => void
    stateChangedListeners: StateChangeCallback[] = []
    routeChangedListeners: RouteChangeCallback[] = []

    constructor(
        onPageRender: () => void,
        beginLoadingData: () => void,
        endLoadingData: () => void,
        public currentPageState: LoadingStates,
        public currentPageLocation: string,
    ) {
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
