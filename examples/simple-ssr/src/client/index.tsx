import React from 'react'
import ReactDOM from 'react-dom'
import { getTransferredState } from '@project-watchtower/runtime'

import { App, AppState } from '../common/App'

// We can get the transferred state by using the getTransferredState function
const state = getTransferredState<AppState>('STATE')

if (!state) {
    // tslint:disable-next-line:no-console
    console.error('State not transferred from server, cannot start client')
} else {
    const render = () => {
        ReactDOM.hydrate(<App config={state.config} />, document.getElementById('root'))
    }

    render()

    if (module.hot) {
        module.hot.accept('../common/App', () => {
            setTimeout(render)
        })
    }
}
