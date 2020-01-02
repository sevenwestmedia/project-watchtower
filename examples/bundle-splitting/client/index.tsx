import React from 'react'
import ReactDOM from 'react-dom'

import { App } from '../common/App'
import { loadableReady } from '@loadable/component'

const render = () => {
    ReactDOM.hydrate(<App />, document.getElementById('root'))
}

loadableReady(() => {
    render()
})

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })
}
