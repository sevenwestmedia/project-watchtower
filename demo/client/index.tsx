import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cssHotReload } from 'project-watchtower/lib/client/dev'

const render = () => {
    const App = require('../common/App').default
    ReactDOM.render(<App />, document.getElementById('app-root'))
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })

    cssHotReload()
}
