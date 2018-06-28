import { elapsed } from '../../universal'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { RenderPassResult } from './render-app-to-string'

export interface StaticRouterContext {
    url?: string
    statusCode?: number
}

export interface SuccessProps<SSRRequestProps extends object> {
    renderResult: RenderPassResult
    ssrRequestProps: SSRRequestProps
    startTime: [number, number]
    statusCode: number
}

export const createResponse = <SSRRequestProps extends object>({
    renderResult,
    ssrRequestProps,
    startTime,
    statusCode,
}: SuccessProps<SSRRequestProps>): ServerRenderResult<SSRRequestProps> => {
    return {
        type: ServerRenderResultType.Success,
        elapsed: elapsed(startTime),
        head: renderResult.head,
        renderedContent: renderResult.renderMarkup,
        ssrRequestProps,
        statusCode,
    }
}

export const routerContextHandler = <SSRRequestProps extends object>(
    renderResult: RenderPassResult,
    startTime: [number, number],
    ssrRequestProps: SSRRequestProps,
): ServerRenderResult<SSRRequestProps> => {
    if (renderResult.context.url) {
        return {
            type: ServerRenderResultType.Redirect,
            head: renderResult.head,
            redirectTo: renderResult.context.url,
            isPermanent: renderResult.context.statusCode === 301,
            elapsed: elapsed(startTime),
        }
    }

    const statusCode = renderResult.context.statusCode ? renderResult.context.statusCode : 200

    return createResponse({
        renderResult,
        ssrRequestProps,
        startTime,
        statusCode,
    })
}
