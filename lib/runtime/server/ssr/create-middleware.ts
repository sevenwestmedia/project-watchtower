import { Request, RequestHandler, Express } from 'express'
import * as redux from 'redux'
import {
    ServerSideRenderOptions,
    StatusServerRenderResult,
    renderPageContents,
    Assets,
    RenderMarkup,
    ServerRenderResultType,
} from './'
import { PromiseCompletionSource, Logger } from '../../universal'
import { getAssetLocations } from '../../server'
import { HelmetData } from 'react-helmet'
import { CreateReduxStore } from '../ssr'
import { hasLog } from '../middleware/ensure-request-log-middleware'

export interface RenderContext<AdditionalState = object> {
    completionNotifier: PromiseCompletionSource<{}>
    triggeredLoad: boolean
    additionalState: AdditionalState
}

export type RenderApp<ReduxState extends object> = (
    params: {
        log: Logger
        store: redux.Store<ReduxState>
        context: RenderContext
        req: Request
    },
) => JSX.Element
export type RenderHtml<ReduxState extends object> = (
    params: {
        head: HelmetData | undefined
        renderMarkup: RenderMarkup
        reduxState: ReduxState
        assets: Assets
        context: RenderContext
        req: Request
    },
) => string

export type ServerSideRenderMiddlewareOptions<ReduxState extends object> = {
    app: Express
    ssrTimeoutMs: number
    renderApp: RenderApp<ReduxState>
    renderHtml: RenderHtml<ReduxState>
    errorLocation: string
    createReduxStore: CreateReduxStore<ReduxState>
}

export const createSsrMiddleware = <ReduxState extends object>(
    options: ServerSideRenderMiddlewareOptions<ReduxState>,
): RequestHandler => {
    const assets = getAssetLocations()

    return async (req, response, next) => {
        if (!hasLog(req)) {
            console.error('Skipping SSR middleware due to missing req.log key')
            return next()
        }
        let renderContext: RenderContext
        const additionalState: object = {}

        const ssrOptions: ServerSideRenderOptions<ReduxState> = {
            log: req.log,
            errorLocation: options.errorLocation,
            ssrTimeoutMs: options.ssrTimeoutMs,
            appRender: store => {
                renderContext = {
                    completionNotifier: new PromiseCompletionSource<{}>(),
                    triggeredLoad: false,
                    additionalState,
                }

                return options.renderApp({ log: req.log, store, context: renderContext, req })
            },
            createReduxStore: options.createReduxStore,
            events: {
                renderPerformed: promiseTracker => {
                    // loadAllCompleted will not fire if nothing started loading
                    // this is needed to not hang the return
                    if (
                        renderContext.triggeredLoad &&
                        !renderContext.completionNotifier.completed
                    ) {
                        promiseTracker.track(renderContext.completionNotifier.promise)
                    }
                },
            },
        }
        const pageRenderResult = await renderPageContents<ReduxState>(ssrOptions, req)

        const createPageMarkup = (result: StatusServerRenderResult<ReduxState>) =>
            options.renderHtml({
                head: result.head,
                renderMarkup: result.renderedContent,
                reduxState: result.reduxState,
                assets,
                context: renderContext,
                req,
            })

        switch (pageRenderResult.type) {
            case ServerRenderResultType.Success:
                response
                    .status(pageRenderResult.statusCode)
                    .header('Content-Type', 'text/html')
                    .send(createPageMarkup(pageRenderResult))
                return
            case ServerRenderResultType.Redirect:
                response.redirect(
                    pageRenderResult.isPermanent ? 301 : 302,
                    pageRenderResult.redirectTo,
                )
                return
            case ServerRenderResultType.Failure:
            default:
                // tslint:disable-line:no-switch-case-fall-through
                response.status(500).send()
        }
    }
}
