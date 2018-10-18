import React from 'react'
import ReactDOM from 'react-dom'
import { cssHotReload } from '../../../lib/runtime/client'
import { getTransferredState } from '../../../lib/runtime/client/get-transferred-state'

import { App, AppState } from '../common/App'

// We can get the transferred state by using the getTransferredState function
const state = getTransferredState<AppState>('STATE')

if (!state) {
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

        cssHotReload()
    }
}
