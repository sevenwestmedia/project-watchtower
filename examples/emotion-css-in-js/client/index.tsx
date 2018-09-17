import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cssHotReload } from '../../../lib/runtime/client'
import { getTransferredState } from '../../../lib/runtime/client/get-transferred-state'
import { hydrate } from 'emotion'

import { App } from '../common/App'

// We can get the transferred state by using the getTransferredState function
const emotionIds = getTransferredState<string[]>('_emotionIds')

if (emotionIds) {
    hydrate(emotionIds)
}

const render = () => {
    ReactDOM.hydrate(<App />, document.getElementById('root'))
}

render()

if (module.hot) {
    module.hot.accept('../common/App', () => {
        setTimeout(render)
    })

    cssHotReload()
}
