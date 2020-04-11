import { RenderPassResult } from './render-app-to-string'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { formatElapsed } from '@project-watchtower/runtime'

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
        elapsed: formatElapsed(process.hrtime(startTime)),
        head: renderResult.head,
        renderLocation,
        renderedContent: renderResult.renderResult,
        ssrRequestProps,
        statusCode,
        type: ServerRenderResultType.Success,
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
            elapsed: formatElapsed(process.hrtime(startTime)),
            head: renderResult.head,
            isPermanent: renderResult.context.statusCode === 301,
            redirectTo: renderResult.context.url,
            type: ServerRenderResultType.Redirect,
        }
    }

    const statusCode = renderResult.context.statusCode ? renderResult.context.statusCode : 200

    return createResponse({
        renderLocation,
        renderResult,
        ssrRequestProps,
        startTime,
        statusCode,
    })
}
