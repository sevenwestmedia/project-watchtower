import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cssHotReload } from 'project-watchtower/lib/runtime/client'

import { App } from '../common/App'

const render = () => {
    ReactDOM.render(<App />, document.getElementById('app-root'))
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })

    cssHotReload()
}
