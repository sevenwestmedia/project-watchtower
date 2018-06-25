import { Request, RequestHandler, Express } from 'express'
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
import { hasLog } from '../middleware/ensure-request-log-middleware'
import { getRuntimeConfig } from '../../config/config'

export interface RenderContext<AdditionalState = object> {
    completionNotifier: PromiseCompletionSource<{}>
    triggeredLoad: boolean
    /** This holds the app state which needs to be kept between SSR
     * passes. It is essentially a state bag, it could include a redux store,
     * or any other state store which needs to persist between render passes
     */
    additionalState: AdditionalState
}

export type RenderApp<AdditionalState extends object = object> = (
    params: {
        log: Logger
        context: RenderContext<AdditionalState>
        req: Request
    },
) => JSX.Element
export type RenderHtml<AdditionalState extends object> = (
    params: {
        head: HelmetData | undefined
        renderMarkup: RenderMarkup
        assets: Assets
        context: RenderContext<AdditionalState>
        req: Request
    },
) => string

export type ServerSideRenderMiddlewareOptions<AdditionalState extends object> = {
    app: Express & { log: Logger }
    ssrTimeoutMs: number
    setupRequest: (req: Request) => Promise<AdditionalState>
    renderApp: RenderApp<AdditionalState>
    renderHtml: RenderHtml<AdditionalState>
    errorLocation: string
}

export const createSsrMiddleware = <AdditionalState extends object>(
    options: ServerSideRenderMiddlewareOptions<AdditionalState>,
): RequestHandler => {
    const runtimeConfig = getRuntimeConfig(options.app.log)
    const assets = getAssetLocations(runtimeConfig)

    return async (req, response, next) => {
        if (!hasLog(req)) {
            console.error('Skipping SSR middleware due to missing req.log key')
            return next()
        }
        const appState = await options.setupRequest(req)
        let renderContext: RenderContext<AdditionalState>

        const ssrOptions: ServerSideRenderOptions = {
            log: req.log,
            errorLocation: options.errorLocation,
            ssrTimeoutMs: options.ssrTimeoutMs,
            appRender: promiseTracker => {
                // If we have previously rendered, we need to not bother tracking the
                // previous completion notifier
                if (renderContext) {
                    promiseTracker.untrack(renderContext.completionNotifier.promise)
                }

                renderContext = {
                    completionNotifier: new PromiseCompletionSource(),
                    triggeredLoad: false,
                    additionalState: appState,
                }

                return options.renderApp({ log: req.log, context: renderContext, req })
            },
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

        const pageRenderResult = await renderPageContents<AdditionalState>(
            appState,
            ssrOptions,
            req,
        )

        const createPageMarkup = (result: StatusServerRenderResult<AdditionalState>) =>
            options.renderHtml({
                head: result.head,
                renderMarkup: result.renderedContent,
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
