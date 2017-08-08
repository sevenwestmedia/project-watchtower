import * as helmet from 'helmet'
import { Request, Response, Express } from 'express'
import * as redux from 'redux'
import {
  WatchtowerOptions,
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
export type RenderApp = <ReduxState extends object>(
    logger: Logger, store: redux.Store<ReduxState>,
    context: RenderContext, req: RenderRequest,
) => JSX.Element
export type RenderHtml<ReduxState extends object> = (
    head: HelmetData | undefined,
    renderMarkup: RenderMarkup,
    reduxState: ReduxState,
    assets: Assets,
) => string
export type ResultType<ReduxState extends object> =
    | SuccessServerRenderResult<ReduxState> | PageNotFoundRenderResult<ReduxState>

export const createSsrMiddleware = <ReduxState extends object>(
    app: Express,
    ssrTimeoutMs: number,
    renderApp: RenderApp,
    renderHtml: RenderHtml<ReduxState>,
    errorLocation: string,
    createReduxStore: WatchtowerOptions<ReduxState>['createReduxStore'],
) => {
    // We require helmet middleware registered
    app.use(helmet())
    const assets = getAssetLocations()

    return async (req: RenderRequest, response: Response) => {
        let renderContext: RenderContext

        const options: WatchtowerOptions<ReduxState> = {
            log: req.log,
            errorLocation,
            ssrTimeoutMs,
            appRender: (store) => {
                renderContext = {
                    completionNotifier: new PromiseCompletionSource<{}>(),
                    triggeredLoad: false,
                }
                return renderApp(req.log, store, renderContext, req)
            },
            createReduxStore,
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
        const pageRenderResult = await renderPageContents<ReduxState>(req.url, options)

        const createPageMarkup = (result: ResultType<ReduxState>) => (
            renderHtml(
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
