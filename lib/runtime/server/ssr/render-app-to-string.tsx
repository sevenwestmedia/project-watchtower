import * as React from 'react'
import { Helmet, HelmetData } from 'react-helmet'
import { StaticRouter } from 'react-router-dom'
import { functionTimer, Logger } from '../../universal'
import { StaticRouterContext } from './router-context-handler'
import { PromiseTracker } from './full-render'

export type CreateAppElement = (promiseTracker: PromiseTracker) => React.ReactElement<any>

export interface RenderPassResult<RenderResult> {
    head: HelmetData
    context: StaticRouterContext
    renderResult: RenderResult
}

export function renderApp<RenderResult>(
    currentLocation: string,
    renderFn: (element: React.ReactElement<any>) => RenderResult,
    log: Logger,
    appRender: CreateAppElement,
    promiseTracker: PromiseTracker,
): RenderPassResult<RenderResult> {
    // first create a context for <StaticRouter>, it's where we keep the
    // results of rendering for the second pass if necessary
    const context: StaticRouterContext = {}
    let renderResult: RenderResult
    let head: HelmetData

    try {
        renderResult = functionTimer(
            'Server side render',
            () =>
                renderFn(
                    <StaticRouter location={currentLocation} context={context}>
                        {appRender(promiseTracker)}
                    </StaticRouter>,
                ),
            log,
        )
    } finally {
        head = Helmet.rewind()
    }

    return {
        context,
        renderResult,
        head,
    }
}
