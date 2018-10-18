import React from 'react'
import { App } from './app'
import { render } from 'react-dom'

import './index.scss'

/**
 * For testing only
 */

const renderApp = () => {
    render(<App />, document.getElementById('root'))
}

renderApp()
