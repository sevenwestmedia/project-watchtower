import React from 'react'

export interface Props {
    config: AppState['config']
}

// This interface defines the state we will send from the server
// to the client.
// It could contain redux state, or any other types of state which needs
// to be transferred
export interface AppState {
    config: { greeting: string }
}

export const App: React.SFC<Props> = props => <h1>{props.config.greeting}</h1>
