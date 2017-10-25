import { elapsed } from '../../universal'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { RenderPassResult } from './render-app-to-string'

export interface StaticRouterContext {
    url?: string
    statusCode?: number
}

export interface SuccessProps<T extends object> {
    renderResult: RenderPassResult,
    reduxState: T,
    startTime: [number, number],
    statusCode: number
}

export const createResponse = <T extends object>({
    renderResult,
    reduxState,
    startTime,
    statusCode,
}: SuccessProps<T>): ServerRenderResult<T> => {
    return {
        type: ServerRenderResultType.Success,
        elapsed: elapsed(startTime),
        head: renderResult.head,
        renderedContent: renderResult.renderMarkup,
        reduxState,
        statusCode,
    }
}

export const routerContextHandler = <T extends object>(
    renderResult: RenderPassResult,
    startTime: [number, number],
    reduxState: T,
): ServerRenderResult<T> => {
    if (renderResult.context.url) {
        return {
            type: ServerRenderResultType.Redirect,
            head: renderResult.head,
            redirectTo: renderResult.context.url,
            isPermanent: renderResult.context.statusCode === 301,
            elapsed: elapsed(startTime),
        }
    }

    const statusCode = renderResult.context.statusCode
        ? renderResult.context.statusCode
        : 200

    return createResponse({
        renderResult,
        reduxState,
        startTime,
        statusCode,
    })
}
