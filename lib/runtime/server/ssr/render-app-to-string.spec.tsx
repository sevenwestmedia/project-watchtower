/**
 * @jest-environment node
 */

import * as React from 'react'
import * as redux from 'redux'
import { Route, Switch } from 'react-router-dom'
import renderToString from './render-app-to-string'
import { createConsoleLogger } from '../../universal'

const Home: React.SFC<{}> = () => <div>Home</div>
const TestApp: React.SFC<{}> = () => (
    <Switch>
        <Route exact path="/" component={Home} />
    </Switch>
)

it('renders app callback with router', () => {
    const store = redux.createStore(() => ({}))

    const renderResult = renderToString('/', store, createConsoleLogger(), _ => <TestApp />)

    expect(renderResult.renderMarkup).toMatchSnapshot()
})
