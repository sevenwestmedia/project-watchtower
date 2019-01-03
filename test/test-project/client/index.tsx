import React from 'react'
import { render } from 'react-dom'
import { App } from './app'

/**
 * For testing only
 */

const renderApp = () => {
    render(<App />, document.getElementById('root'))
}

renderApp()
