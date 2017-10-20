import * as redux from 'redux'
import thunk from 'redux-thunk'

import { PromiseTracker, elapsed, Logger } from '../../universal'
import resolveAllData from './helpers/recursive-task-resolver'
import handleRouterContextResult, { success } from './router-context-handler'
import * as ServerRenderResults from './server-render-results'
import renderToString, { CreateAppElement } from './render-app-to-string'
import { WatchtowerEvents } from './render-events'
import { RenderRequest } from '../ssr'

export { PromiseTracker }
export interface RenderOptions {
    log: Logger
    errorLocation: string
    appRender: CreateAppElement
    events?: WatchtowerEvents
}

export type CreateReduxStore<ReduxState extends object, SsrRequest extends RenderRequest> = (
    middlewares: redux.Middleware[],
    req: SsrRequest,
) => Promise<redux.Store<ReduxState>>

export interface ServerSideRenderOptions<
    ReduxState extends object,
    SsrRequest extends RenderRequest
> extends RenderOptions {
    ssrTimeoutMs: number
    createReduxStore: CreateReduxStore<ReduxState, SsrRequest>
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

async function renderPageContents<T extends object, SsrRequest extends RenderRequest>(
    options: ServerSideRenderOptions<T, SsrRequest>,
    req: SsrRequest,
): Promise<ServerRenderResults.ServerRenderResult<T>> {
    const { url: currentLocation } = req
    const START_FAST_MODE = process.env.START_FAST_MODE === 'true'
    const startTime = process.hrtime()
    const promiseTracker = new PromiseTracker()
    let store: redux.Store<T>
    try {
        store = await options.createReduxStore(
            [promiseTracker.middleware(), thunk.withExtraArgument({ log: options.log })],
            req,
        )
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
        renderToString(location, store, options.log, options.appRender)

    const render = (location: string): ServerRenderResults.ServerRenderResult<T> => {
        // We need to capture the store before we render
        // as any changes caused by the render will not be
        // included in the rendered content
        const storeStateAtRenderTime = store.getState()
        try {
            const renderResult = performSinglePassLocationRender(location)

            const result = handleRouterContextResult(
                renderResult,
                startTime,
                storeStateAtRenderTime,
            )

            if (options.events && options.events.renderPerformed) {
                try {
                    options.events.renderPerformed(promiseTracker)
                } catch (err) {
                    // External event failed. Just log and continue
                    options.log.error({ err }, 'renderPerformed event failed')
                }
            }

            return result
        } catch (err) {
            options.log.error(err)
            const errorRender = performSinglePassLocationRender(options.errorLocation)

            return success(errorRender, storeStateAtRenderTime, startTime)
        }
    }

    if (START_FAST_MODE) {
        const successResult: ServerRenderResults.SuccessServerRenderResult<T> = {
            type: ServerRenderResults.ServerRenderResultType.Success,
            renderedContent: {
                html: '',
                css: '',
                ids: [],
            },
            reduxState: store.getState(),
            elapsed: elapsed(startTime),
            head: undefined,
        }

        return successResult
    }

    try {
        const initialRenderResult = render(currentLocation)

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
            () => render(currentLocation),
            initialRenderResult,
            10,
            options.ssrTimeoutMs,
        )

        if (dataResolved.type === ServerRenderResults.ServerRenderResultType.Success) {
            if (dataResolved.reduxState !== store.getState()) {
                options.log.debug('Store has changed since initial SSR, doing another pass')
                return render(currentLocation)
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

export default renderPageContents
