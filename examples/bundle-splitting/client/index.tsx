import React from 'react'
import ReactDOM from 'react-dom'
import { cssHotReload } from '../../../lib/runtime/client'

import { App } from '../common/App'

const render = () => {
    ReactDOM.render(<App />, document.getElementById('root'))
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })

    cssHotReload()
}
