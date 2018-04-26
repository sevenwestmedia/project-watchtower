import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as H from 'history'

import { PageProps } from './PageLifecycleProvider'
import { PageLifecycle } from './PageLifecycle'
import { getDisplayName } from '../../util/getDisplayName'
import { LoggerProps } from '../LogProvider/LogProvider'
import { withLog } from '../LogProvider/with-log'

export type LifecycleComponent<T> =
    | React.ComponentClass<PageLifecycleProps & T>
    | React.SFC<PageLifecycleProps & T>

export type LoadingStates = 'loading' | 'loaded'

export type LifecycleState = {
    currentPageState: LoadingStates
    currentPageLocation: H.Location
}
export type PageLifecycleProps = LifecycleState & PageProps

export type StateChangeCallback = (state: LifecycleState) => void
export type RouteChangeCallback = (location: H.Location) => void

export const withPageLifecycleEvents = (Component: React.ComponentClass<any>) => {
    Component.contextTypes = {
        ...Component.contextTypes,
        pageLifecycle: PropTypes.object,
    }

    return Component
}

export function withPageLifecycleProps<T>(
    Component: LifecycleComponent<T>,
): React.ComponentClass<T> {
    return withLog(
        class WithPageLifecycleProps extends React.Component<T & LoggerProps, LifecycleState> {
            static displayName = `withPageLifecycleProps(${getDisplayName(Component)})`

            static contextTypes = {
                pageLifecycle: PropTypes.object,
            }

            context: {
                pageLifecycle: PageLifecycle
            }

            state: LifecycleState

            constructor(props: T & LoggerProps, context: { pageLifecycle: PageLifecycle }) {
                super(props, context)

                this.state = {
                    currentPageState: context.pageLifecycle.currentPageState,
                    currentPageLocation: context.pageLifecycle.currentPageLocation,
                }
            }

            componentDidMount() {
                if (!this.context.pageLifecycle) {
                    return
                }
                this.context.pageLifecycle.onPageStateChanged(this.pageStateChanged)
            }

            componentWillUnmount() {
                this.context.pageLifecycle.offPageStateChanged(this.pageStateChanged)
            }

            pageStateChanged = (pageState: LifecycleState) => {
                if (this.context.pageLifecycle.enableTraceLogging) {
                    this.props.logger.debug(
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
        },
    )
}
