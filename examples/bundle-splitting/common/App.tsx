import React from 'react'
import Loadable from 'react-loadable'
import './App.scss'

const LazyThings = Loadable({
    loader: () => import('./Things'),
    webpack: () => [require.resolveWeak('./Things') as number],
    modules: ['./Things'],
    loading: () => <p>Loading</p>,
    render(loaded, {}) {
        const Component = loaded.Things
        return <Component />
    },
})

export const App = () => (
    <div>
        <LazyThings />
    </div>
)

export default App
