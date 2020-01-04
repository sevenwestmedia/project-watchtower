/**
 * @jest-environment node
 */

import React from 'react'
import { renderToString } from 'react-dom/server'
import { Route, Switch } from 'react-router-dom'
import { consoleLogger } from 'typescript-log'
import { renderApp } from './render-app-to-string'
import { PromiseTracker } from '../utils/promise-tracker'

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
        consoleLogger(),
        () => <TestApp />,
        new PromiseTracker(),
    )

    expect(renderResult.renderResult).toMatchSnapshot()
})
