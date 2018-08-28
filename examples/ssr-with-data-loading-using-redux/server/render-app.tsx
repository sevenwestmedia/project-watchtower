import * as React from 'react'
import { App } from '../common/App'
import { SSRState } from './start'
import { Provider } from 'react-redux'

export const renderApp = (state: SSRState) => {
    return (
        <Provider store={state.store}>
            <App />
        </Provider>
    )
}
