import * as React from 'react'
import { BrowserRouter, BrowserRouterProps, Route, RouteProps } from 'react-router-dom'
import { createLocation } from 'history'

export type Props = RouteProps
export interface State {
    initialLocationKey: string | undefined
    locationOverrideFromSSR: string | undefined
}

declare var watchtowerHydrateLocation: string
const serverRouteState =
    typeof watchtowerHydrateLocation !== 'undefined' ? watchtowerHydrateLocation : undefined

class HydrateCorrectLocationFromSSR extends React.Component<Props, State> {
    state: State = { initialLocationKey: undefined, locationOverrideFromSSR: serverRouteState }

    getDerivedStateFromProps(nextProps: Readonly<Props>, prevState: State): null | Partial<State> {
        if (!prevState.initialLocationKey && nextProps.location) {
            return {
                // We need to capture the inital location key. This allows
                // us to overwrite the current location artifically until the
                // user navigates
                initialLocationKey: nextProps.location.key,
            }
        }

        return null
    }

    render() {
        // While still on the initial route (which was hydrated), override the url
        // if an override came from the server
        const locationOverride =
            this.props.location &&
            this.state.locationOverrideFromSSR &&
            this.state.initialLocationKey === this.props.location.key
                ? createLocation(this.state.locationOverrideFromSSR)
                : undefined

        return <Route location={locationOverride}>{this.props.children}</Route>
    }
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
