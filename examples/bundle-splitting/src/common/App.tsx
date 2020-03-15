import React from 'react'
import loadable from '@loadable/component'

const LazyThings = loadable(() => import('./Things'))

export const App = () => (
    <div>
        <LazyThings />
    </div>
)

export default App
