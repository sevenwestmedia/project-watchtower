import { formatElapsed } from '../../universal'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { RenderPassResult } from './render-app-to-string'

export interface StaticRouterContext {
    url?: string
    statusCode?: number
}

export interface SuccessProps<SSRRequestProps extends object, RenderResult> {
    renderResult: RenderPassResult<RenderResult>
    ssrRequestProps: SSRRequestProps
    startTime: [number, number]
    statusCode: number
    renderLocation: string
}

export const createResponse = <SSRRequestProps extends object, RenderResult>({
    renderResult,
    ssrRequestProps,
    startTime,
    statusCode,
    renderLocation,
}: SuccessProps<SSRRequestProps, RenderResult>): ServerRenderResult<
    SSRRequestProps,
    RenderResult
> => {
    return {
        type: ServerRenderResultType.Success,
        elapsed: formatElapsed(process.hrtime(startTime)),
        head: renderResult.head,
        renderedContent: renderResult.renderResult,
        ssrRequestProps,
        statusCode,
        renderLocation,
    }
}

export const routerContextHandler = <SSRRequestProps extends object, RenderResult>(
    renderResult: RenderPassResult<RenderResult>,
    startTime: [number, number],
    ssrRequestProps: SSRRequestProps,
    renderLocation: string,
): ServerRenderResult<SSRRequestProps, RenderResult> => {
    if (renderResult.context.url) {
        return {
            type: ServerRenderResultType.Redirect,
            head: renderResult.head,
            redirectTo: renderResult.context.url,
            isPermanent: renderResult.context.statusCode === 301,
            elapsed: formatElapsed(process.hrtime(startTime)),
        }
    }

    const statusCode = renderResult.context.statusCode ? renderResult.context.statusCode : 200

    return createResponse({
        renderResult,
        ssrRequestProps,
        startTime,
        statusCode,
        renderLocation,
    })
}
