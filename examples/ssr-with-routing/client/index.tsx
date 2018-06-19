import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cssHotReload } from '../../../lib/runtime/client'

import { App } from '../common/App'
import { BrowserRouter } from 'react-router-dom'

const render = () => {
    ReactDOM.hydrate(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
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
