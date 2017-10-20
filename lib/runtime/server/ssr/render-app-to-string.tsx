import * as React from 'react'
import * as redux from 'redux'
import { Helmet, HelmetData } from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { renderStaticOptimized, GlamorServerResult } from 'glamor/server'
import { StaticRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { functionTimer, Logger, LogProvider } from '../../universal'
import { StaticRouterContext } from './router-context-handler'

export type CreateAppElement = (store: redux.Store<any>) => React.ReactElement<any>

export interface RenderMarkup {
    html: string
    css: string
    ids: string[]
}

export interface RenderPassResult {
    head: HelmetData
    context: StaticRouterContext
    renderMarkup: RenderMarkup
}

export default (
    currentLocation: string,
    store: redux.Store<any>,
    log: Logger,
    appRender: CreateAppElement,
): RenderPassResult => {
    // first create a context for <StaticRouter>, it's where we keep the
    // results of rendering for the second pass if necessary
    const context: StaticRouterContext = {}
    let renderMarkup: GlamorServerResult
    let head: HelmetData

    try {
        renderMarkup = functionTimer(
            'Server side render',
            () =>
                renderStaticOptimized(() =>
                    renderToString(
                        <Provider store={store}>
                            <LogProvider logger={log}>
                                <StaticRouter location={currentLocation} context={context}>
                                    {appRender(store)}
                                </StaticRouter>
                            </LogProvider>
                        </Provider>,
                    ),
                ),
            log,
        )
    } finally {
        head = Helmet.rewind()
    }

    return {
        context,
        renderMarkup,
        head,
    }
}
