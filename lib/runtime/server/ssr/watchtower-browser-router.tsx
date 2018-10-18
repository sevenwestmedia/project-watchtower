import H from 'history'
import React from 'react'
import { BrowserRouter, BrowserRouterProps, Route, RouteProps } from 'react-router-dom'
import { createLocation } from 'history'
import { getTransferredState } from '../../client/get-transferred-state'

const locationOverrideFromSSR = getTransferredState<string | undefined>(
    'watchtower_hydrate_location',
)

/**
 * A wrapper around React routers Browser router
 * It takes care of hydrating error routes if they happened on the server.
 * Other than initial hydration it does nothing additional
 */
export class WatchtowerBrowserRouter extends React.Component<BrowserRouterProps> {
    static displayName = 'WatchtowerBrowserRouter'
    initialLocation: H.Location | undefined

    render() {
        const { children, ...props } = this.props
        return (
            <BrowserRouter {...props}>
                <Route
                    render={(routeProps: RouteProps) => {
                        if (!this.initialLocation) {
                            this.initialLocation = routeProps.location
                        }

                        // While still on the initial route (which was hydrated), override the url
                        // if an override came from the server
                        const locationOverride =
                            this.initialLocation === routeProps.location && locationOverrideFromSSR
                                ? createLocation(locationOverrideFromSSR)
                                : undefined

                        if (locationOverride) {
                            return <Route location={locationOverride}>{this.props.children}</Route>
                        }

                        return React.Children.only(this.props.children)
                    }}
                />
            </BrowserRouter>
        )
    }
}
