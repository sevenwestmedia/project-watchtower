import { Request, RequestHandler, Express } from 'express'
import {
    ServerSideRenderOptions,
    StatusServerRenderResult,
    renderPageContents,
    PageTags,
    RenderMarkup,
    ServerRenderResultType,
} from './'
import { PromiseCompletionSource, Logger } from '../../universal'
import { HelmetData } from 'react-helmet'
import { hasLog } from '../middleware/ensure-request-log-middleware'
import { getRuntimeConfig } from '../../config/config'
import { PromiseTracker } from '../../util/promise-tracker'
import { getAssetLocations, getHeadAssets, getBodyAssets } from '../assets'
import { Assets } from 'assets-webpack-plugin'

export interface RenderContext<SSRRequestProps = object> {
    completionNotifier: PromiseCompletionSource<{}>
    triggeredLoad: boolean
    /** This holds the app state which needs to be kept between SSR
     * passes. It is essentially a state bag, it could include a redux store,
     * or any other state store which needs to persist between render passes
     */
    ssrRequestProps: SSRRequestProps
}

export type RenderApp<SSRRequestProps extends object> = (
    params: {
        log: Logger
        context: RenderContext<SSRRequestProps>
        req: Request
    },
) => JSX.Element

export type RenderHtmlParams<SSRRequestProps extends object> = {
    head: HelmetData | undefined
    renderMarkup: RenderMarkup
        pageTags: PageTags
    context: RenderContext<SSRRequestProps>
    req: Request
}
export type RenderHtml<SSRRequestProps extends object> = (
    params: RenderHtmlParams<SSRRequestProps>,
) => string

export type CreatePageTags<SSRRequestProps> = (
    options: {
        buildAssets: Assets
        helmetTags: string[]
        renderContext: RenderContext<SSRRequestProps>
    },
) => PageTags

export type ServerSideRenderMiddlewareOptions<SSRRequestProps extends object> = {
    app: Express & { log: Logger }
    ssrTimeoutMs: number
    setupRequest: (req: Request, promiseTracker: PromiseTracker) => Promise<SSRRequestProps>
    renderApp: RenderApp<SSRRequestProps>
    renderHtml: RenderHtmlParams<SSRRequestProps>
    errorLocation: string
    createPageTags?: CreatePageTags<SSRRequestProps>
}

export const createSsrMiddleware = <SSRRequestProps extends object>(
    options: ServerSideRenderMiddlewareOptions<SSRRequestProps>,
): RequestHandler => {
    const runtimeConfig = getRuntimeConfig(options.app.log)
    const buildAssets = getAssetLocations(runtimeConfig)

    return async (req, response, next) => {
        if (!hasLog(req)) {
            console.error('Skipping SSR middleware due to missing req.log key')
            return next()
        }

        const promiseTracker = new PromiseTracker()
        const appState = await options.setupRequest(req, promiseTracker)
        let renderContext: RenderContext<SSRRequestProps>

        const ssrOptions: ServerSideRenderOptions = {
            log: req.log,
            errorLocation: options.errorLocation,
            ssrTimeoutMs: options.ssrTimeoutMs,
            appRender: () => {
                renderContext = {
                    completionNotifier: new PromiseCompletionSource(),
                    triggeredLoad: false,
                    ssrRequestProps: appState,
                }

                return options.renderApp({ log: req.log, context: renderContext, req })
            },
            events: {
                renderPerformed: () => {
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

        const pageRenderResult = await renderPageContents<SSRRequestProps>(
            appState,
            ssrOptions,
            req,
            promiseTracker,
        )

        const createPageMarkup = (result: StatusServerRenderResult<SSRRequestProps>) => {
            const helmetTags: string[] = []
            if (result.head && result.head.title) {
                helmetTags.push(result.head.title.toString())
            }
            if (result.head && result.head.base) {
                helmetTags.push(result.head.base.toString())
            }
            if (result.head && result.head.script) {
                helmetTags.push(result.head.script.toString())
            }
            if (result.head && result.head.meta) {
                helmetTags.push(result.head.meta.toString())
            }
            if (result.head && result.head.link) {
                helmetTags.push(result.head.link.toString())
            }

            const pageTags: PageTags = options.createPageTags
                ? options.createPageTags({ buildAssets, helmetTags, renderContext })
                : {
                      head: [...helmetTags.map(tag => ({ tag })), ...getHeadAssets(buildAssets)],
                      body: [...getBodyAssets(buildAssets)],
                  }

            return options.renderHtml({
                head: result.head,
                renderMarkup: result.renderedContent,
                pageTags,
                context: renderContext,
                req,
            })
        }

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
