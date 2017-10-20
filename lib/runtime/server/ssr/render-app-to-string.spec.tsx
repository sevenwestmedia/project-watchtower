/**
 * @jest-environment node
 */

import * as React from 'react'
import * as redux from 'redux'
import { Route, Switch } from 'react-router-dom'
import renderToString from './render-app-to-string'
import { testLogger } from './helpers/test-logger'

const Home: React.SFC<{}> = () => <div>Home</div>
const TestApp: React.SFC<{}> = () => (
    <Switch>
        <Route exact path="/" component={Home} />
    </Switch>
)

it('renders app callback with router', () => {
    const store = redux.createStore(() => ({}))

    const renderResult = renderToString('/', store, testLogger, _ => <TestApp />)

    expect(renderResult.renderMarkup).toMatchSnapshot()
})
