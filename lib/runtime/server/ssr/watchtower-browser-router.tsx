import * as React from 'react'
import { BrowserRouter, BrowserRouterProps, Route, RouteProps } from 'react-router-dom'
import { createLocation } from 'history'
import { getTransferredState } from '../../client/get-transferred-state'

export type Props = RouteProps

const locationOverrideFromSSR = getTransferredState<string | undefined>(
    'watchtower_hydrate_location',
)

const HydrateCorrectLocationFromSSR: React.SFC<Props> = props => {
    // While still on the initial route (which was hydrated), override the url
    // if an override came from the server
    const locationOverride =
        props.location && locationOverrideFromSSR && props.location.key === undefined
            ? createLocation(locationOverrideFromSSR)
            : undefined

    if (locationOverride) {
        return <Route location={locationOverride}>{props.children}</Route>
    }

    return React.Children.only(props.children)
}

/**
 * A wrapper around React routers Browser router
 * It takes care of hydrating error routes if they happened on the server.
 * Other than initial hydration it does nothing additional
 */
export const WatchtowerBrowserRouter: React.SFC<BrowserRouterProps> = ({ children, ...props }) => (
    <BrowserRouter {...props}>
        <Route
            render={(routeProps: RouteProps) => (
                <HydrateCorrectLocationFromSSR {...routeProps}>
                    {children}
                </HydrateCorrectLocationFromSSR>
            )}
        />
    </BrowserRouter>
)
