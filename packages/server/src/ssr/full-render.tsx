import { Logger } from 'typescript-log'
import { Information, Status404Error, Warning } from '@project-watchtower/runtime'
import { recursiveTaskResolver } from './helpers/recursive-task-resolver'
import { CreateAppElement, renderApp } from './render-app-to-string'
import { WatchtowerEvents } from './render-events'
import { routerContextHandler } from './router-context-handler'
import * as ServerRenderResults from './server-render-results'
import { PromiseTracker } from '../utils/promise-tracker'
import { formatElapsed } from '@project-watchtower/runtime'

export interface RenderOptions<RenderResult> {
    log: Logger
    errorLocation: string
    pageNotFoundLocation: string
    appRender: CreateAppElement
    events?: WatchtowerEvents
    renderFn: (element: React.ReactElement<any>) => RenderResult
}

export interface ServerSideRenderOptions<RenderResult> extends RenderOptions<RenderResult> {
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
    preBody: PageTag[]
    body: PageTag[]
}

async function renderErrorRoute<SSRRequestProps extends object, RenderResult>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions<RenderResult>,
    currentRenderLocation: string,
    promiseTracker: PromiseTracker,
    err: Error,
    startTime: [number, number],
): Promise<ServerRenderResults.ServerRenderResult<SSRRequestProps, RenderResult>> {
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

function performRender<SSRRequestProps extends object, RenderResult>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions<RenderResult>,
    renderLocation: string,
    promiseTracker: PromiseTracker,
    startTime: [number, number],
): ServerRenderResults.ServerRenderResult<SSRRequestProps, RenderResult> {
    // We need to capture the store before we render
    // as any changes caused by the render will not be
    // included in the rendered content
    const storeStateAtRenderTime: SSRRequestProps = {
        ...(ssrRequestProps as object),
    } as any

    try {
        const renderResult = renderApp(
            renderLocation,
            options.renderFn,
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
            } catch (err: any) {
                // External event failed. Just log and continue
                options.log.error({ err }, 'renderPerformed event failed')
            }
        }
    }
}

async function renderWithErrorPageFallback<SSRRequestProps extends object, RenderResult>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions<RenderResult>,
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
            } catch (err: any) {
                // external event failed, log and continue
                options.log.error({ err, location }, 'beginWaitingForTasks threw, continuing')
            }
        }

        const dataResolved = await recursiveTaskResolver(
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
    } catch (dataLoadErr: any) {
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

export async function renderPageContents<SSRRequestProps extends object, RenderResult>(
    ssrRequestProps: SSRRequestProps,
    options: ServerSideRenderOptions<RenderResult>,
    location: string,
    promiseTracker: PromiseTracker,
): Promise<ServerRenderResults.ServerRenderResult<SSRRequestProps, RenderResult>> {
    const startTime = process.hrtime()

    try {
        return await renderWithErrorPageFallback(
            ssrRequestProps,
            options,
            location,
            promiseTracker,
            startTime,
        )
    } catch (err: any) {
        const failure: ServerRenderResults.FailedRenderResult = {
            elapsed: formatElapsed(process.hrtime(startTime)),
            errorMessage: 'Failed to do render',
            head: undefined,
            type: ServerRenderResults.ServerRenderResultType.Failure,
        }
        options.log.error({ err }, 'Failed to render')

        return failure
    }
}
