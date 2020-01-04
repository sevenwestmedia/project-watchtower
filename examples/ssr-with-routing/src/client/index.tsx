import React from 'react'
import ReactDOM from 'react-dom'

import { WatchtowerBrowserRouter } from '@project-watchtower/runtime'
import { App } from '../common/App'

const render = () => {
    ReactDOM.hydrate(
        <WatchtowerBrowserRouter>
            <App />
        </WatchtowerBrowserRouter>,
        document.getElementById('root'),
    )
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })
}
