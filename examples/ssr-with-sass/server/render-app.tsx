import React from 'react'
import { App, AppState } from '../common/App'

export const renderApp = (state: AppState) => {
    return <App config={state.config} />
}
