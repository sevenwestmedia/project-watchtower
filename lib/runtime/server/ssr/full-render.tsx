import * as redux from 'redux'
import thunk from 'redux-thunk'
import { Request } from 'express'

import { PromiseTracker, elapsed, Logger } from '../../universal'
import resolveAllData from './helpers/recursive-task-resolver'
import { createResponse, routerContextHandler } from './router-context-handler'
import * as ServerRenderResults from './server-render-results'
import renderToString, { CreateAppElement } from './render-app-to-string'
import { WatchtowerEvents } from './render-events'

export { PromiseTracker }
export interface RenderOptions {
    log: Logger
    errorLocation: string
    appRender: CreateAppElement
    events?: WatchtowerEvents
}

export type CreateReduxStore<ReduxState extends object> = (
    middlewares: redux.Middleware[],
    req: Request,
) => Promise<redux.Store<ReduxState>>

export interface ServerSideRenderOptions<ReduxState extends object> extends RenderOptions {
    ssrTimeoutMs: number
    createReduxStore: CreateReduxStore<ReduxState>
}

// tslint:disable:trailing-comma
export interface Assets {
    vendor: {
        js: string
    }
    main: {
        js: string
        css: string
    }
}

export async function renderPageContents<T extends object>(
    options: ServerSideRenderOptions<T>,
    req: Request,
): Promise<ServerRenderResults.ServerRenderResult<T>> {
    let renderLocation = req.url
    const START_FAST_MODE = process.env.START_FAST_MODE === 'true'
    const startTime = process.hrtime()
    const promiseTracker = new PromiseTracker()
    let store: redux.Store<T>
    try {
        const promiseTrackerMiddleware: redux.Middleware = promiseTracker.middleware()
        const thunkMiddleware: redux.Middleware = thunk.withExtraArgument({ log: options.log })
        store = await options.createReduxStore([promiseTrackerMiddleware, thunkMiddleware], req)
    } catch (err) {
        const failure: ServerRenderResults.FailedRenderResult = {
            type: ServerRenderResults.ServerRenderResultType.Failure,
            errorMessage: 'Failed to create redux store',
            elapsed: elapsed(startTime),
            head: undefined,
        }

        options.log.error({ err }, failure.errorMessage)

        return failure
    }

    const performSinglePassLocationRender = (location: string) =>
        renderToString(location, store, options.log, options.appRender, promiseTracker)

    const render = (location: string): ServerRenderResults.ServerRenderResult<T> => {
        // We need to capture the store before we render
        // as any changes caused by the render will not be
        // included in the rendered content
        const storeStateAtRenderTime = store.getState()
        try {
            const renderResult = performSinglePassLocationRender(location)

            const result = routerContextHandler(renderResult, startTime, storeStateAtRenderTime)

            return result
        } catch (err) {
            // If we are already rendering the error location, bail
            if (renderLocation === options.errorLocation) {
                throw err
            }
            options.log.error(err)
            // Overwrite the render location with the error location
            renderLocation = options.errorLocation
            const errorRender = performSinglePassLocationRender(renderLocation)

            return createResponse({
                renderResult: errorRender,
                reduxState: storeStateAtRenderTime,
                startTime,
                statusCode: 500,
            })
        } finally {
            if (options.events && options.events.renderPerformed) {
                try {
                    options.events.renderPerformed(promiseTracker)
                } catch (err) {
                    // External event failed. Just log and continue
                    options.log.error({ err }, 'renderPerformed event failed')
                }
            }
        }
    }

    if (START_FAST_MODE) {
        const successResult: ServerRenderResults.StatusServerRenderResult<T> = {
            type: ServerRenderResults.ServerRenderResultType.Success,
            renderedContent: {
                html: '',
                css: '',
                ids: [],
            },
            reduxState: store.getState(),
            elapsed: elapsed(startTime),
            head: undefined,
            statusCode: 200,
        }

        return successResult
    }

    try {
        const initialRenderResult = render(renderLocation)

        // If we have not rendered successfully just return the render result
        if (initialRenderResult.type !== ServerRenderResults.ServerRenderResultType.Success) {
            return initialRenderResult
        }

        if (options.events && options.events.beginWaitingForTasks) {
            try {
                options.events.beginWaitingForTasks(elapsed(startTime))
            } catch (err) {
                // external event failed, log and continue
                options.log.error({ err }, 'beginWaitingForTasks threw, continuing')
            }
        }

        const dataResolved = await resolveAllData(
            options.log,
            promiseTracker,
            () => render(renderLocation),
            initialRenderResult,
            10,
            options.ssrTimeoutMs,
        )

        if (dataResolved.type === ServerRenderResults.ServerRenderResultType.Success) {
            if (dataResolved.reduxState !== store.getState()) {
                options.log.debug('Store has changed since initial SSR, doing another pass')
                return render(renderLocation)
            }
        }

        return dataResolved
    } catch (err) {
        const failure: ServerRenderResults.FailedRenderResult = {
            type: ServerRenderResults.ServerRenderResultType.Failure,
            errorMessage: 'Failed to do render',
            elapsed: elapsed(startTime),
            head: undefined,
        }
        options.log.error({ err }, 'Failed to render')

        return failure
    }
}
