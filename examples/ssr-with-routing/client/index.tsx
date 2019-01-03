import React from 'react'
import ReactDOM from 'react-dom'
import { cssHotReload } from '../../../lib/runtime/client'

import { WatchtowerBrowserRouter } from '../../../lib/runtime/server/ssr/watchtower-browser-router'
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

    cssHotReload()
}
