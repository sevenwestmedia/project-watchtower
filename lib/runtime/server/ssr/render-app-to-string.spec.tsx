/**
 * @jest-environment node
 */

import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { renderApp } from './render-app-to-string'
import { createConsoleLogger, PromiseTracker } from '../../universal'
import { renderToString } from 'react-dom/server'

const Home: React.SFC<{}> = () => <div>Home</div>
const TestApp: React.SFC<{}> = () => (
    <Switch>
        <Route exact path="/" component={Home} />
    </Switch>
)

it('renders app callback with router', () => {
    const renderResult = renderApp(
        '/',
        renderToString,
        createConsoleLogger(),
        () => <TestApp />,
        new PromiseTracker(),
    )

    expect(renderResult.renderResult).toMatchSnapshot()
})
