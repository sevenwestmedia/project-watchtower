import { PromiseTracker, formatElapsed, Logger } from '../../universal'
import resolveAllData from './helpers/recursive-task-resolver'
import { routerContextHandler } from './router-context-handler'
import * as ServerRenderResults from './server-render-results'
import { renderAppToString, CreateAppElement } from './render-app-to-string'
import { WatchtowerEvents } from './render-events'
import { Status404Error, Warning, Information } from './errors'

export { PromiseTracker }

export interface RenderOptions {
    log: Logger
    errorLocation: string
    pageNotFoundLocation: string
    appRender: CreateAppElement
    events?: WatchtowerEvents
}

export interface ServerSideRenderOptions extends RenderOptions {
    ssrTimeoutMs: number
    /** Used when the request url is re-written to reset the SSR request state */
    resetRequest: (location: string) => Promise<any>
}

export interface PageTag {
    /** The html tag to insert into the rendered html */
    tag: string
}

export interface PageTags {
    head: PageTag[]
    body: PageTag[]
}

async function renderErrorRoute<SSRRequestProps extends object>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions,
    currentRenderLocation: string,
    promiseTracker: PromiseTracker,
    err: Error,
    startTime: [number, number],
): Promise<ServerRenderResults.ServerRenderResult<SSRRequestProps>> {
    const errorRenderOptions =
        err instanceof Status404Error
            ? { location: options.pageNotFoundLocation, status: 404 }
            : { location: options.errorLocation, status: 500 }

    // If we are already rendering the error location, bail
    // This will be caught above and a 500 will be returned
    if (currentRenderLocation === errorRenderOptions.location) {
        throw err
    }
    // Reset the request state, don't want it for the error route
    options.resetRequest(errorRenderOptions.location)

    // Overwrite the render location with the error location
    currentRenderLocation = errorRenderOptions.location
    const errorRender = await renderWithErrorPageFallback(
        ssrRequestProps,
        options,
        errorRenderOptions.location,
        promiseTracker,
        startTime,
    )

    if (errorRender.type === ServerRenderResults.ServerRenderResultType.Success) {
        // We have successfully rendered the error page, but it still needs
        // to be an error status code (404 or 500)
        errorRender.statusCode = errorRenderOptions.status
    }

    return errorRender
}

function performRender<SSRRequestProps extends object>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions,
    renderLocation: string,
    promiseTracker: PromiseTracker,
    startTime: [number, number],
): ServerRenderResults.ServerRenderResult<SSRRequestProps> {
    // We need to capture the store before we render
    // as any changes caused by the render will not be
    // included in the rendered content
    const storeStateAtRenderTime: SSRRequestProps = {
        ...(ssrRequestProps as object),
    } as any

    try {
        const renderResult = renderAppToString(
            renderLocation,
            options.log,
            options.appRender,
            promiseTracker,
        )

        const result = routerContextHandler(
            renderResult,
            startTime,
            storeStateAtRenderTime,
            renderLocation,
        )

        return result
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

async function renderWithErrorPageFallback<SSRRequestProps extends object>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions,
    renderLocation: string,
    promiseTracker: PromiseTracker,
    startTime: [number, number],
) {
    // The inner try is for the initial render
    // if it throws, then the error route will try to render
    // which the second catch is if that route fails
    try {
        const initialRenderResult = performRender(
            ssrRequestProps,
            options,
            renderLocation,
            promiseTracker,
            startTime,
        )

        // If we have not rendered successfully just return the render result
        if (initialRenderResult.type !== ServerRenderResults.ServerRenderResultType.Success) {
            return initialRenderResult
        }

        if (options.events && options.events.beginWaitingForTasks) {
            try {
                options.events.beginWaitingForTasks(formatElapsed(process.hrtime(startTime)))
            } catch (err) {
                // external event failed, log and continue
                options.log.error({ err, location }, 'beginWaitingForTasks threw, continuing')
            }
        }

        const dataResolved = await resolveAllData(
            options.log,
            promiseTracker,
            () =>
                performRender(ssrRequestProps, options, renderLocation, promiseTracker, startTime),
            renderLocation,
            initialRenderResult,
            10,
            options.ssrTimeoutMs,
        )

        return dataResolved
    } catch (dataLoadErr) {
        if (dataLoadErr instanceof Information) {
            options.log.info({ err: dataLoadErr }, 'Data load warning, rendering error location')
        } else if (dataLoadErr instanceof Warning) {
            options.log.warn({ err: dataLoadErr }, 'Data load warning, rendering error location')
        } else {
            options.log.error({ err: dataLoadErr }, 'Data load failed, rendering error location')
        }

        return await renderErrorRoute(
            ssrRequestProps,
            options,
            renderLocation,
            promiseTracker,
            dataLoadErr,
            startTime,
        )
    }
}

export async function renderPageContents<SSRRequestProps extends object>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions,
    location: string,
    promiseTracker: PromiseTracker,
): Promise<ServerRenderResults.ServerRenderResult<SSRRequestProps>> {
    const startTime = process.hrtime()

    try {
        return await renderWithErrorPageFallback(
            ssrRequestProps,
            options,
            location,
            promiseTracker,
            startTime,
        )
    } catch (err) {
        const failure: ServerRenderResults.FailedRenderResult = {
            type: ServerRenderResults.ServerRenderResultType.Failure,
            errorMessage: 'Failed to do render',
            elapsed: formatElapsed(process.hrtime(startTime)),
            head: undefined,
        }
        options.log.error({ err }, 'Failed to render')

        return failure
    }
}
