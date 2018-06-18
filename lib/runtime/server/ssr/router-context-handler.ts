import { elapsed } from '../../universal'
import { ServerRenderResult, ServerRenderResultType } from './server-render-results'
import { RenderPassResult } from './render-app-to-string'

export interface StaticRouterContext {
    url?: string
    statusCode?: number
}

export interface SuccessProps<AdditionalState extends object> {
    renderResult: RenderPassResult
    additionalState: AdditionalState
    startTime: [number, number]
    statusCode: number
}

export const createResponse = <AdditionalState extends object>({
    renderResult,
    additionalState,
    startTime,
    statusCode,
}: SuccessProps<AdditionalState>): ServerRenderResult<AdditionalState> => {
    return {
        type: ServerRenderResultType.Success,
        elapsed: elapsed(startTime),
        head: renderResult.head,
        renderedContent: renderResult.renderMarkup,
        additionalState,
        statusCode,
    }
}

export const routerContextHandler = <AdditionalState extends object>(
    renderResult: RenderPassResult,
    startTime: [number, number],
    additionalState: AdditionalState,
): ServerRenderResult<AdditionalState> => {
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
        additionalState,
        startTime,
        statusCode,
    })
}
