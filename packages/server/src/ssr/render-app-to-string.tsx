import React from 'react'
import { HelmetProvider, HelmetServerState } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom'
import { Logger } from 'typescript-log'
import { functionTimer } from '@project-watchtower/runtime'
import { StaticRouterContext } from './router-context-handler'
import { PromiseTracker } from '../utils/promise-tracker'

export type CreateAppElement = (promiseTracker: PromiseTracker) => React.ReactElement<any>

type HelmetProviderContext = {
    helmet?: HelmetServerState;
}

export interface RenderPassResult<RenderResult> {
    head?: HelmetServerState
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
    const helmetContext: HelmetProviderContext = {}
    const renderResult = functionTimer(
        'Server side render',
        () =>
            renderFn(
                <HelmetProvider context={helmetContext}>
                    <StaticRouter location={currentLocation} context={context}>
                        {appRender(promiseTracker)}
                    </StaticRouter>
                </HelmetProvider>,
            ),
        log,
    )

    return {
        context,
        head: helmetContext.helmet,
        renderResult,
    }
}
