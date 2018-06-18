import * as React from 'react'
import { Helmet, HelmetData } from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { renderStaticOptimized, GlamorServerResult } from 'glamor/server'
import { StaticRouter } from 'react-router-dom'
import { functionTimer, Logger, LogProvider } from '../../universal'
import { StaticRouterContext } from './router-context-handler'
import { PromiseTracker } from './full-render'

export type CreateAppElement = (promiseTracker: PromiseTracker) => React.ReactElement<any>

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

export function renderAppToString(
    currentLocation: string,
    log: Logger,
    appRender: CreateAppElement,
    promiseTracker: PromiseTracker,
): RenderPassResult {
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
                        <LogProvider logger={log}>
                            <StaticRouter location={currentLocation} context={context}>
                                {appRender(promiseTracker)}
                            </StaticRouter>
                        </LogProvider>,
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
