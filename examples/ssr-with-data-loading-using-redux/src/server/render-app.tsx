import React from 'react'
import { Provider } from 'react-redux'
import { App } from '../common/App'
import { SSRState } from './start'

export const renderApp = (state: SSRState) => {
    return (
        <Provider store={state.store}>
            <App />
        </Provider>
    )
}
