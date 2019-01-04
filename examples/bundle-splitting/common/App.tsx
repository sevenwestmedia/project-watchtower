import React from 'react'
import Loadable from 'react-loadable'

const LazyThings = Loadable({
    loader: () => import(/* webpackChunkName: "ThingsChunk" */ './Things'),
    loading: () => <p>{'Things is Loading'}</p>,
    modules: ['./Things'],
    webpack: () => [require.resolveWeak('./Things') as number],
    render(loaded: { Things: any }, {  }: any) {
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
