import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { getTransferredState } from '../../../lib/runtime/client/get-transferred-state'

import { App } from '../common/App'
import { AppState } from '../common/App.redux'
import createStore from '../common/createStore'

// We can get the transferred state by using the getTransferredState function
const state = getTransferredState<AppState>('STATE')
const store = createStore(state)

const render = () => {
    ReactDOM.hydrate(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root'),
    )
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })
}
