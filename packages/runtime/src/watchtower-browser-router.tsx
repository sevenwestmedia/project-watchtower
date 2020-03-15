import H from 'history'
import React from 'react'
import { createLocation } from 'history'
import { BrowserRouter, BrowserRouterProps, Route, RouteProps } from 'react-router-dom'

import { HelmetProvider } from 'react-helmet-async'
import { getTransferredState } from './get-transferred-state'

const locationOverrideFromSSR = getTransferredState<string | undefined>(
    'watchtower_hydrate_location',
)

/**
 * A wrapper around React routers Browser router
 * It takes care of hydrating error routes if they happened on the server.
 *
 * It also wraps your application in a HelmetProvider
 */
export const WatchtowerBrowserRouter: React.FC<BrowserRouterProps> = ({ children, ...props }) => {
    const initialLocation = React.useRef<H.Location>()

    return (
        <HelmetProvider>
            <BrowserRouter {...props}>
                <Route
                    render={(routeProps: RouteProps) => {
                        if (!initialLocation.current) {
                            initialLocation.current = routeProps.location
                        }

                        // While still on the initial route (which was hydrated), override the url
                        // if an override came from the server
                        const locationOverride =
                            initialLocation.current === routeProps.location &&
                            locationOverrideFromSSR
                                ? createLocation(locationOverrideFromSSR)
                                : undefined

                        if (locationOverride) {
                            return <Route location={locationOverride}>{children}</Route>
                        }

                        return React.Children.only(children)
                    }}
                />
            </BrowserRouter>
        </HelmetProvider>
    )
}
WatchtowerBrowserRouter.displayName = 'WatchtowerBrowserRouter'
