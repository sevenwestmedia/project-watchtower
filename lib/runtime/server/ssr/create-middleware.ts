import * as helmet from 'helmet'
import { Request, Response, Express } from 'express'
import * as redux from 'redux'
import {
  ServerSideRenderOptions,
  SuccessServerRenderResult,
  PageNotFoundRenderResult,
  renderPageContents,
  Assets,
  RenderMarkup,
  ServerRenderResultType,
} from './'
import { PromiseCompletionSource, Logger } from '../../universal'
import { getAssetLocations } from '../../server'
import { HelmetData } from 'react-helmet'

export interface RenderContext {
    completionNotifier: PromiseCompletionSource<{}>
    triggeredLoad: boolean
}

export type RenderRequest = Request & { log: Logger }
export type RenderApp<ReduxState extends object, SsrRequest extends RenderRequest> = (
    logger: Logger, store: redux.Store<ReduxState>,
    context: RenderContext, req: SsrRequest,
) => JSX.Element
export type RenderHtml<ReduxState extends object> = (
    head: HelmetData | undefined,
    renderMarkup: RenderMarkup,
    reduxState: ReduxState,
    assets: Assets,
) => string
export type ResultType<ReduxState extends object> =
    | SuccessServerRenderResult<ReduxState>
    | PageNotFoundRenderResult<ReduxState>

export type ServerSideRenderMiddlewareOptions<
    ReduxState extends object,
    SsrRequest extends RenderRequest,
> = {
    app: Express,
    ssrTimeoutMs: number,
    renderApp: RenderApp<ReduxState, SsrRequest>,
    renderHtml: RenderHtml<ReduxState>,
    errorLocation: string,
    createReduxStore: ServerSideRenderOptions<ReduxState>['createReduxStore'],
}

export const createSsrMiddleware = <
    ReduxState extends object,
    SsrRequest extends RenderRequest = RenderRequest
>(
    options: ServerSideRenderMiddlewareOptions<ReduxState, SsrRequest>,
) => {
    // We require helmet middleware registered
    options.app.use(helmet())
    const assets = getAssetLocations()

    return async (req: SsrRequest, response: Response) => {
        let renderContext: RenderContext

        const ssrOptions: ServerSideRenderOptions<ReduxState> = {
            log: req.log,
            errorLocation: options.errorLocation,
            ssrTimeoutMs: options.ssrTimeoutMs,
            appRender: (store) => {
                renderContext = {
                    completionNotifier: new PromiseCompletionSource<{}>(),
                    triggeredLoad: false,
                }
                return options.renderApp(req.log, store, renderContext, req)
            },
            createReduxStore: options.createReduxStore,
            events: {
                renderPerformed: (promiseTracker) => {
                    // loadAllCompleted will not fire if nothing started loading
                    // this is needed to not hang the return
                    // tslint:disable-next-line:max-line-length
                    if (renderContext.triggeredLoad && !renderContext.completionNotifier.completed) {
                        promiseTracker.track(renderContext.completionNotifier.promise)
                    }
                },
            },
        }
        const pageRenderResult = await renderPageContents<ReduxState>(ssrOptions, req)

        const createPageMarkup = (result: ResultType<ReduxState>) => (
            options.renderHtml(
                result.head,
                result.renderedContent,
                result.reduxState,
                assets,
        ))

        switch (pageRenderResult.type) {
            case ServerRenderResultType.Success:
                response
                    .status(200)
                    .header('Content-Type', 'text/html')
                    .send(createPageMarkup(pageRenderResult))
                return
            case ServerRenderResultType.PageNotFound:
                response
                    .status(404)
                    .header('Content-Type', 'text/html')
                    .send(createPageMarkup(pageRenderResult))
                return
            case ServerRenderResultType.Redirect:
                response.redirect(
                    pageRenderResult.isPermanent ? 301 : 302,
                    pageRenderResult.redirectTo)
                return
            case ServerRenderResultType.Failure:
            default: // tslint:disable-line:no-switch-case-fall-through
                response.status(500).send()
        }
    }
}
