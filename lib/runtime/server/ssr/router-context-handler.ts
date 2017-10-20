import { elapsed } from '../../universal'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { RenderPassResult } from './render-app-to-string'

export interface StaticRouterContext {
    url?: string
    statusCode?: number
}

export const success = <T extends object>(
    result: RenderPassResult,
    reduxState: T,
    startTime: [number, number]
): ServerRenderResult<T> => {
    return {
        type: ServerRenderResultType.Success,
        elapsed: elapsed(startTime),
        head: result.head,
        renderedContent: result.renderMarkup,
        reduxState
    }
}

export const notFound = <T extends object>(
    result: RenderPassResult,
    reduxState: T,
    startTime: [number, number]
): ServerRenderResult<T> => {
    return {
        type: ServerRenderResultType.PageNotFound,
        elapsed: elapsed(startTime),
        head: result.head,
        renderedContent: result.renderMarkup,
        reduxState
    }
}

export default <T extends object>(
    renderResult: RenderPassResult,
    startTime: [number, number],
    reduxState: T
): ServerRenderResult<T> => {
    if (renderResult.context.url) {
        return {
            type: ServerRenderResultType.Redirect,
            head: renderResult.head,
            redirectTo: renderResult.context.url,
            isPermanent: renderResult.context.statusCode === 301,
            elapsed: elapsed(startTime)
        }
    }

    if (renderResult.context.statusCode === 404) {
        return notFound(renderResult, reduxState, startTime)
    }

    return success(renderResult, reduxState, startTime)
}
